const express = require("express");
const cors = require("cors");
const { jsPDF } = require("jspdf");
const axios = require("axios");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b2nov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Helper function to convert image URL to Base64
const getBase64ImageFromURL = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const base64 = Buffer.from(response.data, "binary").toString("base64");
  return `data:image/jpeg;base64,${base64}`;
};

async function run() {
  try {
    const doctorCollection = client.db("doctorsInfo").collection("doctors");

    // Route to download PDF with multi-page support
    // app.get("/downloadDoctorPdf", async (req, res) => {
    //   try {
    //     const doctors = await doctorCollection.find({}).toArray();

    //     // Initialize jsPDF
    //     const doc = new jsPDF();

    //     let yOffset = 20;
    //     const pageHeight = doc.internal.pageSize.height;
    //     const marginBottom = 30; // Margin from the bottom before adding a new page

    //     for (const doctor of doctors) {
    //       doc.setFontSize(12);
    //       doc.text(`Name: ${doctor.doctorsName}`, 10, yOffset);
    //       yOffset += 10;
    //       doc.text(`Email: ${doctor.doctorsEmail}`, 10, yOffset);
    //       yOffset += 10;
    //       doc.text(`Qualifications: ${doctor.qualifications}`, 10, yOffset);
    //       yOffset += 10;
    //       doc.text(`Specialties: ${doctor.specialty.map(spec => spec.label).join(", ")}`, 10, yOffset);
    //       yOffset += 10;
    //       doc.text(`Years of Experience: ${doctor.yearsOfExperience}`, 10, yOffset);
    //       yOffset += 10;
    //       doc.text(`Designation: ${doctor.designationAndDepartment}`, 10, yOffset);
    //       yOffset += 10;

    //       // Get Base64 image for each doctor
    //       const base64Image = await getBase64ImageFromURL(doctor.photo);
    //       doc.addImage(base64Image, "JPEG", 10, yOffset, 50, 50); // Adjust dimensions as needed
    //       yOffset += 60;

    //       // Add chamber details
    //       doctor.chamberInfos.forEach((chamber, i) => {
    //         doc.text(`Chamber ${i + 1}: ${chamber.chamberName}`, 10, yOffset);
    //         yOffset += 10;
    //         doc.text(`Location: ${chamber.location}`, 10, yOffset);
    //         yOffset += 10;
    //         doc.text(`Visiting Hours: ${chamber.visitingHour}`, 10, yOffset);
    //         yOffset += 10;
    //         doc.text(`Price: ${chamber.visitingPrice} BDT`, 10, yOffset);
    //         yOffset += 20;
    //       });

    //       // Check if content exceeds the page height and add a new page if necessary
    //       if (yOffset > pageHeight - marginBottom) {
    //         doc.addPage();
    //         yOffset = 20; // Reset the yOffset for the new page
    //       }
    //     }

    //     // Output the PDF as a buffer
    //     const pdfOutput = doc.output("arraybuffer");

    //     // Send the PDF to the client
    //     res.setHeader("Content-Type", "application/pdf");
    //     res.setHeader("Content-Disposition", "attachment; filename=doctors.pdf");
    //     res.send(Buffer.from(pdfOutput));
    //   } catch (error) {
    //     console.error("Error generating PDF:", error);
    //     res.status(500).send("Error generating PDF");
    //   }
    // });
    app.get("/downloadDoctorPdf", async (req, res) => {
      try {
        const doctors = await doctorCollection.find({}).toArray();
    
        // Initialize jsPDF
        const doc = new jsPDF();
    
        let yOffset = 20;
        const pageHeight = doc.internal.pageSize.height;
        const marginBottom = 30; // Margin from the bottom before adding a new page
    
        for (const doctor of doctors) {
          doc.setFontSize(12);
          doc.text(`Name: ${doctor.doctorsName}`, 10, yOffset);
          yOffset += 10;
          doc.text(`Email: ${doctor.doctorsEmail}`, 10, yOffset);
          yOffset += 10;
          doc.text(`Phone: ${doctor.mobileNumber || 'N/A'}`, 10, yOffset);  // Add phone number
          yOffset += 10;
          doc.text(`Qualifications: ${doctor.qualifications}`, 10, yOffset);
          yOffset += 10;
          doc.text(`Specialties: ${doctor.specialty.map(spec => spec.label).join(", ")}`, 10, yOffset);
          yOffset += 10;
          doc.text(`Years of Experience: ${doctor.yearsOfExperience}`, 10, yOffset);
          yOffset += 10;
          doc.text(`Designation: ${doctor.designationAndDepartment}`, 10, yOffset);
          yOffset += 10;
    
          // Get Base64 image for each doctor
          const base64Image = await getBase64ImageFromURL(doctor.photo);
          doc.addImage(base64Image, "JPEG", 10, yOffset, 50, 50); // Adjust dimensions as needed
          yOffset += 60;
    
          // Add chamber details
          doctor.chamberInfos.forEach((chamber, i) => {
            doc.text(`Chamber ${i + 1}: ${chamber.chamberName}`, 10, yOffset);
            yOffset += 10;
            doc.text(`Location: ${chamber.location}`, 10, yOffset);
            yOffset += 10;
            doc.text(`Visiting Hours: ${chamber.visitingHour}`, 10, yOffset);
            yOffset += 10;
            doc.text(`Price: ${chamber.visitingPrice} BDT`, 10, yOffset);
            yOffset += 20;
          });
    
          // Check if content exceeds the page height and add a new page if necessary
          if (yOffset > pageHeight - marginBottom) {
            doc.addPage();
            yOffset = 20; // Reset the yOffset for the new page
          }
        }
    
        // Output the PDF as a buffer
        const pdfOutput = doc.output("arraybuffer");
    
        // Send the PDF to the client
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=doctors.pdf");
        res.send(Buffer.from(pdfOutput));
      } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Error generating PDF");
      }
    });
    

    // Other routes remain unchanged
    app.post("/addDoctor", async (req, res) => {
      const data = req.body;
      const result = await doctorCollection.insertOne(data);
      res.send(result);
    });

    app.get("/getDoctor", async (req, res) => {
      const result = await doctorCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/getDoctor/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await doctorCollection.findOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Uncomment this if you want to close the client after each run
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
