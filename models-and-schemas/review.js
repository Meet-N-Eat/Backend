const mongoose = require('../db/connection')
 
const reviewSchema = new mongoose.Schema({
    stars: Number,
    body: String,
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    },
    { timestamps: true }
)

module.exports = reviewSchema;
 

