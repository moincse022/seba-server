const express = require("express");
const cors = require("cors");
const pdf = require('html-pdf');
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

async function run() {
  try {
    const doctorCollection = client.db("doctorsInfo").collection("doctors");

    app.post("/addDoctor", async (req, res) => {
      const data = req.body;
      console.log(data);
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

    // Endpoint to generate and download PDF
    app.get("/downloadDoctorPdf", async (req, res) => {
      try {
        const doctors = await doctorCollection.find({}).toArray();
        const htmlContent = `
        <h1>Doctors Information</h1>
        <ul style="display: flex; flex-direction: row; flex-wrap: wrap; list-style-type: none; padding: 0;">
          ${doctors.map(doctor => `
            <li style="list-style-type: none; padding: 10px; border: 1px solid #ccc;">
              <strong>Name:</strong> ${doctor.doctorsName} <br />
              <strong>Specialization:</strong> ${doctor.workplace} <br />
              <strong>Contact:</strong> ${doctor.contact} <br />
              <img src="${doctor.photo}" alt="Doctor's Photo" width="100" height="100" />
            </li>
          `).join('')}
        </ul>
      `;

        pdf.create(htmlContent).toStream((err, stream) => {
          if (err) {
            return res.status(500).send('Error generating PDF');
          }
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=doctors.pdf');
          stream.pipe(res);
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close(); // Uncomment this if you want to close the client after each run
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});