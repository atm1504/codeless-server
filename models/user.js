const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {type: String, required: true},
    name: { type: String, required: false },
    phone: { type: String, required: false },
    uid: { type: String, required: false },
    accessToken: String,
    time: { type: String, required: false },
});
module.exports = mongoose.model('User', userSchema);