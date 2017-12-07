var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Unique: user_id, bundle_id, platform

// create a schema
var schema = new Schema({
  name:         { type: String, default: '', required: true },
}, { versionKey: false });

module.exports = mongoose.model('server', schema);
