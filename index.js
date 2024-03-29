const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://healthunity-client.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    // await client.connect();
    // console.log("Connected to MongoDB");

    const db = client.db("assignment");
    const collection = db.collection("users");

    const suppliesCollection = client.db("assignment").collection("supplies");
    const commentCollection = client.db("assignment").collection("comments");
    const donationCollection = client.db("assignment").collection("donations");
    const volunteerCollection = client
      .db("assignment")
      .collection("volunteers");
    const testimonialCollection = client
      .db("assignment")
      .collection("testimonials");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    app.get("/supplies", async (req, res) => {
      try {
        const result = await suppliesCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.get("/supplies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await suppliesCollection.findOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/create-supply", async (req, res) => {
      const addedSupply = req.body;
      const result = await suppliesCollection.insertOne(addedSupply);
      res.status(200).send(result);
    });

    app.put("/update-supply/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedSupplyPost = req.body;
        const updatedDetails = {
          $set: {
            title: updatedSupplyPost.title,
            image: updatedSupplyPost.image,
            description: updatedSupplyPost.description,
            amount: updatedSupplyPost.amount,
            category: updatedSupplyPost.category,
          },
        };
        const result = await suppliesCollection.updateOne(
          filter,
          updatedDetails
        );
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.delete("/delete-supply/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await suppliesCollection.deleteOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.get("/comment-section", async (req, res) => {
      try {
        const result = await commentCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/create-comment", async (req, res) => {
      const commentData = req.body;
      const result = await commentCollection.insertOne(commentData);
      res.status(200).send(result);
    });

    app.get("/donations", async (req, res) => {
      try {
        const result = await donationCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/create-donation", async (req, res) => {
      const donationData = req.body;
      const result = await donationCollection.insertOne(donationData);
      res.status(200).send(result);
    });

    app.get("/volunteers", async (req, res) => {
      try {
        const result = await volunteerCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/create-volunteer", async (req, res) => {
      const donationData = req.body;
      const result = await volunteerCollection.insertOne(donationData);
      res.status(200).send(result);
    });

    app.get("/testimonials", async (req, res) => {
      try {
        const result = await testimonialCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/create-testimonial", async (req, res) => {
      const donationData = req.body;
      const result = await testimonialCollection.insertOne(donationData);
      res.status(200).send(result);
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
