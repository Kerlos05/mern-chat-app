const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message: {
        type: String,
        // required: true
    },
    sender: {
        type: String,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ConversationSchema = new mongoose.Schema({
    participants: {
        type: [String],
    },
    messages: [MessageSchema]
});

module.exports = mongoose.model('Conversation', ConversationSchema);
