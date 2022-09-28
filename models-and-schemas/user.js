const mongoose = require('../db/connection')
const messageSchema = require('./message')
const friendInviteSchema = require('./friendInvite')
const ObjectId = mongoose.Schema.Types.ObjectId

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  displayname: String,
  profileimg: String,
  location: String,
  about: String,
  likedrestaurants: [{
      type: ObjectId,
      ref: 'Restaurant'
  }],
  friends: [{
      type: ObjectId,
      ref: 'User'
  }],
  friendinvites: [friendInviteSchema],
  messages:[messageSchema],
  events: [{
    restaurant: {
      type: ObjectId,
      ref:'Restaurant'
    },
    participants: [{
      type: ObjectId,
      ref:'User'
    }],
    date: Date
  }],
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
},
{
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
}
)
const User = mongoose.model('User', userSchema)
module.exports = User
 
