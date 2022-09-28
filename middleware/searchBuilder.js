const { query } = require("express")

function searchBuilder(queryObj) {
   const queryKeys = Object.keys(queryObj)
   const queryArray = []
   for(let i=0; i < queryKeys.length; i++) {
      queryArray.push({[queryKeys[i]]: { $regex: '.*'+queryObj[queryKeys[i]]+'.*', $options: 'i' }})
   }
   return queryArray
}

module.exports = searchBuilder