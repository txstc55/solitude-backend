const mongoose = require('mongoose')

const chatBoxTextsScheme = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxLength: 800,
    },
    index: {
        type: Number,
        required: true,
    }
})

module.exports = mongoose.model('chatBoxTexts', chatBoxTextsScheme)