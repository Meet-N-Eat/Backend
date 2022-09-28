const mongoose = require('../db/connection')

const friendInviteSchema = new mongoose.Schema({
   sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   body: String
},
   {timestamps: Boolean}
)

module.exports = friendInviteSchema