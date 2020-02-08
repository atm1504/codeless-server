const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hospiSchema = new Schema({
    email: { type: String, required: true },
    password:{type: String, require: true},
    name: { type: String, required: false },
    phone: { type: String, required: false },
    accessToken: { type: String },
    time: { type: String, required: false },
});
module.exports = mongoose.model('Hospi', hospiSchema);