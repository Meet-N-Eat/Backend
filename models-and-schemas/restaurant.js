const mongoose = require('../db/connection')
const reviewSchema = require('./review')

const restaurantSchema = new mongoose.Schema({
    name: String,
    image_url: String,
    is_closed: Boolean,
    url: String,    display_phone: String,
    categories: [{
        title: String
    }],
    location: {
        address1: String,
        city: String,
        zip_code: String,
        country: String,
        state: String,
        display_address: [String],
        cross_streets: String
    },
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    photos: [String],
    price: String,
    hours: [{
        open: [{
            is_overnight: Boolean,
            start: String,
            end: String,
            day: Number
        }]
    }],
    reviews: [reviewSchema],
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)
module.exports = Restaurant