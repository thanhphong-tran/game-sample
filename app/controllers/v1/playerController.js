var util     = require('util');
var mongoose = require('mongoose');
var jwt      = require('jsonwebtoken');
var Player    = require(global.baseapp + 'models/playerModel.js');
var Server    = require(global.baseapp + 'models/serverModel.js');

function controller(res) { this.res = res; rxController.call(this, res); }
util.inherits(controller, rxController);


// Mobi API

controller.prototype.info = function() {
    let rxdata = this.res.data;

    this.checkAuthorize();

    Player.findById(rxdata.decoded.role_id).exec(function(err, player) {
        if (err || !player) { return rxdata.response({ success: -1, msg: 'Player not found', data: err }); }

        rxdata.response({data: player});
    });
};

// Web API

controller.prototype.POSTauth = function() {
    let rxdata = this.res.data;
    let decoded = this.validateData(rxdata.params.data, pri.jwtconf.secret);

    Player.findOne({ player_id: decoded.player_id, server_id: decoded.server_id }).exec(function(err, player) {
        if (err) { return rxdata.response({ success: -1, msg: err.message }); }

        if (!player) {
            let newPlayer = new Player({
                name: decoded.player_name,
                server_id: decoded.server_id,
                player_id: decoded.player_id
            });

            return newPlayer.save(function(err) {
                if (err) { return rxdata.response({ success: -1, msg: err.message }); }

                let jwtData = {role_id: newPlayer._id};
                newPlayer.authorization = rxu.signData(jwtData, pri.jwtconf.secret);
                rxdata.response({data: { role_id: newPlayer.id, athorization: newPlayer.authorization }});
            });
        }

        let jwtData = {role_id: player._id};
        player.authorization = rxu.signData(jwtData, pri.jwtconf.secret);
        rxdata.response({data: {role_id: player.id, athorization: player.authorization}});
    });
};

controller.prototype.POSTinapp = function() {
    let rxdata = this.res.data;
    let decoded = this.validateData(rxdata.params.data, pri.jwtconf.secret);

    let items = { item_01: 10, item_02: 20, item_03: 30};

    Player.findOne({ _id: decoded.role_id }).exec(function(err, player) {
        if (err || !player) { return rxdata.response({ success: -1, msg: 'Player not found', data: err }); }

        let amount = Number(items[decoded.item_id] || 0);
        player.balance += amount;
        player.save(function(err) {
            if (err) { return rxdata.response({ success: -1, msg: err.message }); }

            rxdata.response({data: {amount: amount}});
        });
    });
};

controller.prototype.POSTcard = function() {
    let rxdata = this.res.data;
    let decoded = this.validateData(rxdata.params.data, pri.jwtconf.secret);

    Player.findOne({ _id: decoded.role_id }).exec(function(err, player) {
        if (err || !player) { return rxdata.response({ success: -1, msg: 'Player not found', data: err }); }

        let amount = Number(decoded.card_amount || 0);
        player.balance += amount;
        player.save(function(err) {
            if (err) { return rxdata.response({ success: -1, msg: err.message }); }

            rxdata.response({data: {amount: amount}});
        });
    });
};

module.exports = controller;
