const mongoose = require('../db/connection')
const objectId = mongoose.Schema.Types.ObjectId 

const messageSchema = new mongoose.Schema({
   sender: {
       type: objectId,
       ref:'User',
       required: true
   },
   recipient: {
       type: objectId,
       ref:'User',
       required: true
   },
   body: String,
},
   {timestamps: Boolean},
)
 
module.exports = messageSchema;
 

