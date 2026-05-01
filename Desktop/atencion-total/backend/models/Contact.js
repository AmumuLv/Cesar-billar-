
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
 name: String,
 email: String,
 phone: String,
 company: String,
 supportStatus: { type: String, default: 'Activo' }
});

module.exports = mongoose.model('Contact', ContactSchema);
