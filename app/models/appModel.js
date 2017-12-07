var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Unique: user_id, bundle_id, platform

// create a schema
var schema = new Schema({
  name:         { type: String, default: '', required: true},
  desc:         { type: String, default: '' },
  icons:        { type: String, default: ''},
  bundle_id:    { type: String, default: '', required: true},
  platform:     { type: String, default: 'android'},
  storeurl:     { type: String, default: ''},
  categories:   { type: String, default: ''},

  key:          { type: String, default: '' },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},

  settings:     { type: mongoose.Schema.Types.Mixed, default: {}},

  default_server_id:    { type: String, default: 'server_01'},
  thirdparty_app_secret:{ type: String, default: 'app_secret_6969'},

  is_deleted: { type: Number, default: 0 },
  is_active:  { type: Number, default: 1 },
  is_instore: { type: Number, default: 0 },
  created_at: { type: Number, default: Math.floor(Date.now() / 1000) },
  updated_at: { type: Number, default: Math.floor(Date.now() / 1000) }
}, { versionKey: false });

schema.pre("validate", function(next) {
    var self = this;
    self.updated_at = Math.floor(Date.now() / 1000);
    next();
});

module.exports = mongoose.model('app', schema);
