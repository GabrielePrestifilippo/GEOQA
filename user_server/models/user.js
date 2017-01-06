var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
    username: String,
    password: String,
    email: String,
    fullName: String,
    registered: Number,
    company: String,
    reasonWarping: String,
    availableMaps: Array
});

