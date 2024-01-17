const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors({
   origin: ["http://localhost:3000", "https://receipe-next-two.vercel.app"],
   optionsSuccessStatus: 200
}))

app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI

const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   }
});

async function run() {
   try {

      client.connect();

      const receipeCollection = client.db("receipeDB").collection("receipe")

      app.get("/receipe", async (req, res) => {
         try {
            const { search } = req.query;

            let queryObject = {};
            if (search) {
               queryObject.title = { $regex: new RegExp(search, 'i') };
            }

            const result = await receipeCollection.find(queryObject).toArray();

            res.send(result);
         } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
         }
      });



      // Post Receipe
      app.post("/receipe", async (req, res) => {
         const receipeData = req.body
         const result = await receipeCollection.insertOne(receipeData)
         res.send(result)
      })

      // Update Receipe
      app.put("/receipe/:id", async (req, res) => {
         const id = req.params.id;
         const updatedData = req.body;
         const query = { _id: new ObjectId(id) };

         const updateReceipe = {
            $set: {
               title: updatedData.title,
               instruction: updatedData.instruction,
               image: updatedData.image,
               ingredient: updatedData.ingredient,
            },
         };

         try {
            const result = await receipeCollection.findOneAndUpdate(query, updateReceipe, { returnDocument: 'after' });
            res.send(result);
         } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
         }
      });


      // Delete Receipe
      app.delete("/receipe/:id", async (req, res) => {
         const id = req.params.id
         const query = { _id: new ObjectId(id) }
         const result = await receipeCollection.deleteOne(query)
         res.send(result)
      })

      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
   res.send("Receipe Server is Running")
})

app.listen(port, () => {
   console.log(`Receipe Server is Running on Port: ${port}`)
})