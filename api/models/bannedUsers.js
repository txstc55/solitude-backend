const mongoose = require('mongoose')

const bannedUsersScheme = new mongoose.Schema({
    hashedIP: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('bannedUsers', bannedUsersScheme)