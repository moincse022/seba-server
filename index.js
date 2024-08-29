
const express = require('express')
const cors = require("cors");
const app = express()
require("dotenv").config();
const port = process.env.PORT || 3000;

// middleware;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b2nov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const doctorCollection = client.db("doctorsInfo").collection("doctors");
    app.post('/', async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await doctorCollection.insertOne(data);
      res.send(result);
    })
    app.get('/doctor', async (req, res) => {
      const result = await docterCollection.find({}).toArray();
      res.send(result);
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})