var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

function rxController(res) { this.res = res; }

rxController.prototype.validate = function(rules) {
    var rxdata     = this.res.data
    var validateResult = rxu.validate(rxdata.params, rules)
    if (!validateResult['rxresult']) {
        rxdata.response({exit: true, success: -1, msg: 'Wrong input', data: validateResult})
    }
}

rxController.prototype.filter = function(hmodel, params, arr_inttype, arr_idtype) {
    // Int type field
    arr_inttype = arr_inttype || ['created_at', 'updated_at', 'is_deleted', 'is_active'];

    // Id type field
    arr_idtype  = arr_idtype || [];

    // Default filter first
    var filter_default = {is_deleted: 0};

    for(var index in params) {
        var curEle = params[index];

        if (index.indexOf('search_') == 0) {
            var curSearchTerm = index.replace('search_', '');

            if (arr_inttype.indexOf(curSearchTerm) > -1) {
                curEle = parseInt(curEle);
                filter_default[curSearchTerm] = curEle;
            } else if (arr_idtype.indexOf(curSearchTerm) > -1) {
                filter_default[curSearchTerm] = curEle;
            } else {
                filter_default[curSearchTerm] = new RegExp(curEle, "i");
            }
        }
    }

    return hmodel.find(filter_default);
};

rxController.prototype.paging = function(hmodel, params) {

    // Paging
    var pg_page = (typeof(params.pg_page) == 'undefined' || parseInt(params.pg_page) < 1 )? 1  : parseInt(params.pg_page)
    var pg_size = (typeof(params.pg_size) == 'undefined' || parseInt(params.pg_size) < 10)? 10 : parseInt(params.pg_size)

    // Sorting
    var st_col    = params.st_col    || 'created_at'
    var st_type = (typeof(params.st_type) == 'undefined' || parseInt(params.st_type) != 1)? -1 : 1
    var st_params = {}; st_params[st_col] = st_type

    return hmodel.limit(pg_size).skip((pg_page - 1) * pg_size).sort(st_params)
}

rxController.prototype.preUpdate = function(editables, params, arr_inttype) {
    arr_inttype = arr_inttype || ['created_at', 'updated_at', 'is_deleted', 'is_active']

    var data_update = {}
    for (index in params) {
        if (editables.indexOf(index) > -1) {
            if (arr_inttype.indexOf(index) > -1) {
                params[index] = parseInt(params[index])
            }
            data_update[index] = params[index]
        }
    }

    return data_update
}

rxController.prototype.preventDupplicate = function(model, params, ignoreId, callback) {
    ignoreId = ignoreId || 0;

    // Ignore current data
    if (ignoreId) {
        params['_id'] = {'$ne': mongoose.Types.ObjectId(ignoreId)};
    }

    var rxdata = this.res.data;
    model.find(params, function(err, docs) {
        if (docs && docs.length) {
            rxdata.response({success: -1, msg: 'Dupplicated data'});
        } else {
            callback();
        }
    });

    return true;
}

rxController.prototype.checkAuthorize = function() {
    var rxdata = this.res.data;
    var authorization = rxdata.params.authorization;
    if (!authorization) { return rxdata.response({success: -1, msg: 'Unauthorized user'}); }

    try {
            rxdata.decoded = jwt.verify(authorization, pri.jwtconf.secret);
    } catch(err) {
            rxdata.response({success: -1, msg: 'Unauthorized user', data: err});
    }
};

rxController.prototype.validateData = function(data, secret) {
    var rxdata = this.res.data;
    try {
        return jwt.verify(data, secret);
    } catch(err) {
        rxdata.response({ success: -1, msg: 'Validation failed', data: err });
    }
};

// rxController.prototype.forwardException = function(err) {
//     throw new Error(err.message);
// };

module.exports = rxController;
