const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const groupSchema = new Schema({
    username: {
      type: [String],
    },
    createdBy: {
      type: String,
    },
});
  
  
module.exports = mongoose.model('Groups', groupSchema);