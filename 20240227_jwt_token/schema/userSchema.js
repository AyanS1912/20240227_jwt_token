const mongoose = require('mongoose')

// Define the schema for users
const users = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
        minLength:6,
    }
})

// Create and export the 'users' model based on the userSchema
module.exports = mongoose.model('users',users)