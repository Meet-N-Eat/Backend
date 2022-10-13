const mongoose = require('../db/connection')
 
const messageSchema = new mongoose.Schema({
   sender: {
       type: mongoose.Schema.Types.ObjectId,
       ref:'User',
       required: true
   },
   recipient: {
       type: mongoose.Schema.Types.ObjectId,
       ref:'User',
       required: true
   },
   body: String,
},
   {timestamps: Boolean},
)
 
module.exports = messageSchema;
 

