const mongoose = require('../db/connection')
 
const messageSchema = new mongoose.Schema({
   subject: String,
   sender: {
       type: mongoose.Schema.Types.ObjectId,
       ref:'User',
       required: true
   },
   recipients: [{
       type: mongoose.Schema.Types.ObjectId,
       ref:'User',
       required: true
   }],
   body: String,
},
   {timestamps: Boolean},
)
 
module.exports = messageSchema;
 

