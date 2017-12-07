var util     = require('util');
var mongoose = require('mongoose');
var jwt      = require('jsonwebtoken');
var Player    = require(global.baseapp + 'models/playerModel.js');
var Server    = require(global.baseapp + 'models/serverModel.js');

function controller(res) { this.res = res; rxController.call(this, res); }
util.inherits(controller, rxController);

controller.prototype.POSTindex = function() {
    let rxdata = this.res.data;

    var server = new Server({
        name: rxdata.params.name
    });

    server.save(function(err) {
        if (err) { return rxdata.response({ success: -1, msg: err.message }); }

        rxdata.response({data: server.id});
    });
};

module.exports = controller;
