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

const bcrypt = require('bcrypt') // Import bcrypt for encrypting
const jwt = require('jsonwebtoken') // Import jwt for Token authentication
const Users = require('./schema/userSchema')
const Posts = require('./schema/postSchema')

app.post('/signup', async (req, res) => {
    try {
        const username = req.body.username
        const password = req.body.password

        // Check if user already exists
        const userExist = await Users.findOne({ username: username })

        if (userExist) {
            return res.status(401).send("Username already exists. Please try another username.")
        }

        // Hash the password
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create a new user
        const newUser = await Users.create({
            username: username,
            password: hashedPassword
        });

        res.status(201).send('New user created successfully.')
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to register new user.")
    }
})






// Start the Express server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
