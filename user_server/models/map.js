var mongoose = require('mongoose');

module.exports = mongoose.model('Maps',{
    id: Number,
    username: String,
    license: String,
    type: String,
    extent: Array
});