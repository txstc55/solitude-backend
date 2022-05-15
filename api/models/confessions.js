const mongoose = require('mongoose')

const confessionsScheme = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxLength: 5000,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    ip: {
        type: String
    },
    lastPostTime: {
        type: Date,
    },
    seenIPs: {
        type: Array,
        default: []
    }
})

module.exports = mongoose.model('confessions', confessionsScheme)