// Load environment variables from a .env file
require('dotenv').config()

const express = require('express') // Import the express module
const app = express() // Create an Express application
app.use(express.json()) // Middleware to parse incoming JSON requests


const mongoose = require('mongoose') // Import the mongoose module for MongoDB connection
const URI = "mongodb+srv://root:root@cluster0.novqvdq.mongodb.net/Router?retryWrites=true&w=majority&appName=Cluster0" 
const PORT = process.env.PORT || 5000 // Port on which the server will listen

// Connect to MongoDB using Mongoose
mongoose.connect(URI)

// Start the Express server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
