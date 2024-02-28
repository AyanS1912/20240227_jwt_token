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
        })

        res.status(201).send('New user created successfully.')
    } catch (error) {
        console.error(error)
        res.status(500).send("Failed to register new user.")
    }
})


app.post('/login', async (req, res) => {
    try {
        const username = req.body.username
        const password = req.body.password

        // Check if the user exists
        const userExist = await Users.findOne({ username: username })

        if (!userExist) {
            return res.status(401).send("Username doesn't exist. Please enter the right username.")
        }

        // Check if the password is correct
        const checkPassword = await bcrypt.compare(password, userExist.password)
        // console.log(checkPassword)

        if (!checkPassword) {
            return res.status(401).send("Incorrect password.")
        }

        // User is authenticated, create JWT token
        const accessToken = jwt.sign({ username: userExist.username }, process.env.SECRET_KEY, { expiresIn: '1h' })

        // Set the token in the response headers
        res.set('Authorization', 'Bearer ' + accessToken)
        res.status(200).send("User logged in successfully.")
    } catch (error) {
        console.error(error)
        res.status(500).send("Failed to login. Try again.")
    }
})

app.post('/posts', async (req, res) => {
    try {

        const token = req.headers.authorization// Extract the JWT token from the request headers
        // Check if the token exists
        if (!token) {
            return res.status(401).send("Access denied. Token not provided.")
        }
        const decodedToken = jwt.verify(token.split(' ')[1], process.env.SECRET_KEY)// Verify the token

        // Extract username from the decoded token
        const author = decodedToken.username
        const userExist = await Users.findOne({ username: author })

        if (!userExist) {
            return res.status(404).send("Author not found.")
        }

        // Extract post details from request body
        const { title, desc } = req.body
        
        const checkTitle = await Posts.findOne({title:title, author: userExist._id})
        if(checkTitle){
            return res.status(406).send("Same Named Title exist for the user.")
        }
        // Create a new post
        const newPost = await Posts.create({
            title: title,
            desc: desc,
            author: userExist._id
        })

        res.status(201).send('New post created successfully.')
    } catch (error) {
        console.error(error)
        res.status(500).send("Failed to Create New Post")
    }
})


app.get('/myposts', async (req,res) => {
    try{
        const token = req.headers.authorization// Extract the JWT token from the request headers
        // Check if the token exists
        if (!token) {
            return res.status(401).send("Access denied. Token not provided.")
        }
        const decodedToken = jwt.verify(token.split(' ')[1], process.env.SECRET_KEY)// Verify the token

        const author = decodedToken.username // Extract username from the decoded token
        
        const userExist = await Users.findOne({ username: author })// Check if the user exists

        if (!userExist) {
            return res.status(404).send("Author not found.")
        }
         // Find posts authored by the user
        const myposts = await Posts.find({author:userExist._id})
        res.status(200).send(myposts)
    }   
    catch(error){
        console.error(error)
        res.status(500).send("Failed to Retrieve data.")
    } 
})

app.delete('/deletepost', async(req,res) => {
    try{
        const token = req.headers.authorization// Extract the JWT token from the request headers

    if(!token){
        res.status(401).send("Access denied. Token not provided.")
    }

    const decodedToken = jwt.verify(token.split(' ')[1],process.env.SECRET_KEY)// Verify the token
    const author = decodedToken.username // Extract username from the decoded token

    const userExist = await Users.findOne({ username: author})// Check if the user exists
    
    if (!userExist) {
        return res.status(404).send("Author not found.")
    }

    const title = req.body.title // Get the title

    const postOwner = await Posts.findOne({title:title})

    if(!(userExist._id === postOwner.author)){
        return res.status(401).send("User not authorised to delete the post.")
    }
    // Find posts authored by the user with given title and delete it,
    const deletePost = await Posts.findOneAndDelete({title:title,author:userExist._id})
    console.log(deletePost)

    if(!deletePost){
        return res.status(404).send("Post not Found")
    }
    res.status(200).send("Post deleted Sucessfully")

    }
    catch(error){
        console.error(error)
        res.status(500).send("Failed to delete Post")
    }

})


// Start the Express server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
