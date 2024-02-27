const mongoose =  require('mongoose')

// Define the schema for posts
const posts = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required:true
    }
})

// Create and export the 'posts' model based on the postSchema
module.exports = mongoose.model('posts',posts)