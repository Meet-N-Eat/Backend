const mongoose = require('../db/connection')
const ObjectId = mongoose.Schema.Types.ObjectId

const eventSchema = new mongoose.Schema({
  restaurant: {
    type: ObjectId,
    ref:'Restaurant'
  },
  participants: [{
    type: ObjectId,
    ref:'User'
  }],
  date: Date,
  createdBy: {
    type: ObjectId,
    ref: 'User'
  }
},
  {timestamps: Boolean}
)

module.exports = eventSchema