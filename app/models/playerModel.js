var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Unique: user_id, bundle_id, platform

// create a schema
var schema = new Schema({
  name:         { type: String, default: '', required: true},
  player_id:    { type: String, default: '', required: true},
  balance:      { type: Number, default: 0, required: true},
  server_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'server', required: true},
  authorization:{ type: String },
}, { versionKey: false });

module.exports = mongoose.model('player', schema);
