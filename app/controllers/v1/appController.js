var util     = require('util');
var mongoose = require('mongoose');
var Model    = require(global.baseapp + 'models/appModel.js');

function controller(res) { this.res = res; rxController.call(this, res); }
util.inherits(controller, rxController);

var DefaultApp = function() { return Model.find({ is_deleted: 0 }); };
var UserApp    = function(userID) { return Model.find({ is_deleted: 0, user: userID }); };

// GET list apps
controller.prototype.index = function() {
  var rxdata = this.res.data;

  this.checkAuthorize();

  var userApp = UserApp(rxdata.decoded.id);
  this.paging(this.filter(userApp, rxdata.params), rxdata.params).exec(function(err, dbarr) {
      cbSuccess(dbarr);
  });

  var cbSuccess = _data=> rxdata.response({success: 1, msg: 'List app success!', data: _data});
};

// GET app details
controller.prototype.details = function() {
  var rxdata = this.res.data;

  this.checkAuthorize();

  var userApp = UserApp(rxdata.decoded.id);
  userApp.findOne({ _id: rxdata.params.id }).exec(function(err, app) {
      if (err || !app) { return rxdata.response({ success: -1, msg: 'App not found', data: err }); }

      rxdata.response({ data: app });
  });
};

// GET app overview
controller.prototype.overview = function() {
  var rxdata = this.res.data;

  this.checkAuthorize();

  var overview = {};

  overview.statistics = {
    touch_points: 87500,
    total_installs: 385,
    conversion_rate: 1238,
    total_revenue: 9999,
    returning_visitors: 28
  };

  overview.user_acquisition_trend = [
      {date: '11/2017', impressions: 65, clicks: 28},
      {date: '10/2017', impressions: 59, clicks: 48},
      {date: '09/2017', impressions: 77, clicks: 43},
      {date: '08/2017', impressions: 55, clicks: 11},
      {date: '07/2017', impressions: 99, clicks: 87},
      {date: '06/2017', impressions: 67, clicks: 55}
  ];

  overview.daily_active = {
    installs: 450,
    open: 400,
    login: 350,
    register: 200,
    create_character: 150
  };

  rxdata.response({success: 1, msg: '', data: overview});
};

// GET delete app
controller.prototype.delete = function() {
  var rxdata = this.res.data;

  this.checkAuthorize();

  var userApp = UserApp(rxdata.decoded.id);
  userApp.findOneAndUpdate({ _id: rxdata.params.id }, { is_deleted: 1 }, { new: false }, function(err) {
    if (err) { return rxdata.response({ success: -1, msg: 'Cant delete', data: err }); }

    cbSuccess(rxdata.params.id);
  });

  var cbSuccess = _data => rxdata.response({data: _data});
};

// GET restore app
controller.prototype.restore = function() {
  var rxdata = this.res.data;

  this.checkAuthorize();

  Model.findOneAndUpdate({ user: rxdata.decoded.id, _id: rxdata.params.id }, { is_deleted: 0 }, { new: false }, function(err) {
    if (err) { return rxdata.response({ success: -1, msg: 'Cant restore', data: err}); }

    cbSuccess(rxdata.params.id);
  });

  var cbSuccess = _data => rxdata.response({data: _data});
};

// POST create app
controller.prototype.POSTindex = function() {
  var rxdata = this.res.data;

  this.checkAuthorize();

  this.validate({
      name:         {required: true},
      bundle_id:    {required: true},
      platform:     {required: true},
  });

  var dbObj = new Model({
    user:       rxdata.decoded.id,
    name:       rxdata.params['name'],
    bundle_id:  rxdata.params['bundle_id'],
    desc:       rxdata.params['desc'],
    is_instore: rxdata.params['is_instore'],
    platform:   rxdata.params['platform'],
    icons:      rxdata.params['icons'],
    storeurl:   rxdata.params['storeurl'],
    categories: rxdata.params['categories'],
    key:        rxu.genhex().substr(0, 32)
  });

  dbObj.settings = {
      is_formal_auth_enable:        true,
      is_facebook_auth_enable:      true,
      is_google_auth_enable:        true,
      is_quickplay_enable:          true,
      is_inapp_purchase_enable:     true,
      is_card_purchase_enable:      true,
  };
  dbObj.markModified('settings');

  var userApp = UserApp(rxdata.decoded.id);
  this.preventDupplicate(userApp, { bundle_id: dbObj.bundle_id, platform: dbObj.platform }, 0, function() {
    dbObj.save(function(err) {
      if (err) { return rxdata.response({success: -1, msg: 'Cant save data', data: err}); }

      cbSuccess(dbObj);
    });
  });

  var cbSuccess = _data => rxdata.response({data: _data});
};

// GET reset app key
controller.prototype.resetkey = function() {
    var rxdata = this.res.data;

    this.checkAuthorize();

    this.validate({
        id: { required: true }
    });

    UserApp(rxdata.decoded.id).findOne({ _id: rxdata.params.id }).exec(function(err, app) {
        if (err || !app) { return rxdata.response({ success: -1, msg: 'App not found', data: err }); }

        app.key = rxu.genhex().substr(0, 32);
        app.save(function(err) {
            if (err) { return rxdata.response({ success: -1, msg: 'Reset failed', data: err }); }

            rxdata.response({ data: app.key });
        });
    });
};

// POST edit app
controller.prototype.POSTedit = function() {
  var rxdata = this.res.data;

  this.checkAuthorize();

  var updating = ['name', 'desc', 'icons', 'storeurl', 'categories', 'is_active', 'is_instore', 'bundle_id', 'settings'];
  var intfield = ['is_active', 'is_instore'];
  var params   = this.preUpdate(updating, rxdata.params, intfield);

  var dupplicateData = { bundle_id: rxdata.params['bundle_id'], platform: rxdata.params['platform'] };
  this.preventDupplicate(UserApp(rxdata.decoded.id), dupplicateData, rxdata.params['_id'], () => {
    Model.findById(rxdata.params._id).exec(function(err, app) {
        if (err || !app) { return rxdata.response({ success: -1, msg: 'App not found', data: err }); }

        for (var key in params) {
            app[key] = params[key];
        }
        app.markModified('settings');
        app.save(function(err) {
            if (err) { return rxdata.response({ success: -1, msg: 'Update failed', data: err }); }

            cbSuccess(app._id);
        });
    });
  });

  var cbSuccess = _data => rxdata.response({data: _data});
};


module.exports = controller;
