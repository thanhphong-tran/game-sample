var util       = require('util')
var mongoose   = require('mongoose')
var validate   = require(global.baseapp + 'include/rxValidate.js')
var crypto     = require('crypto')
var jwt = require('jsonwebtoken');

function rxUtil() {}
var rxu = rxUtil

// Custom promise
mongoose.promise = global.promise;

// Init one time
//rxu.mgo = mongoose.connect('mongodb://gametop_admin:U6C760XNOQnRRQ==@203.113.159.120/gametop')
rxu.mgo = mongoose.connect('mongodb://127.0.0.1/' + global.pri.mgoconf.db, { useMongoClient: true })
mongoose.connection.once('open', function() {
    console.log("Connect to db successfully!");
}).on('error', function() {
    console.error("Connect db failed!");
});

rxu.md5 = function(strsource) {
  var passHash = crypto.createHash('md5').update(strsource).digest("hex")
  return passHash
}

rxu.genhex = function() {
  var newToken = crypto.randomBytes(64).toString('hex')
  return newToken
}

rxu.genstr = function(length, source) {
  length = length || 8
  source = source || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  var result = ''
  for (var i = length; i > 0; --i) result += source[Math.floor(Math.random() * source.length)]

  return result
}

rxu.now = function(unit) {
  const hrTime=process.hrtime()
  switch (unit) {
    case 'milli':return hrTime[0] * 1000 + hrTime[1] / 1000000
    case 'micro':return hrTime[0] * 1000000 + hrTime[1] / 1000
    case 'nano':return hrTime[0] * 1000000000 + hrTime[1]
      break
    default:return hrTime[0] * 1000 + hrTime[1] / 1000000
  }
}

rxu.filter = function(params, filter) {
  for (var index in params) {
    if (filter.indexOf(index) != -1) {
      params.set(index, undefined, {strict: false});
    }
  }
  return params
}

rxu.select = function(params, selections) {
    for (var index in params) {
        if (selections.indexOf(index) == -1) {
            params.set(index, undefined, {strict: false});
        }
    }
    return params;
};

rxu.validate = function(params, rules) {
  var returnSum  = true
  var returnData = {}

  for(index in rules) {
    var tempResult = validate.value(params[index], rules[index])
    if (!tempResult['approved']) {
      returnData[index] = []
      tempResult.each(function(err) { returnData[index].push(err) })
      returnSum = false
    }
  }

  returnData['rxresult'] = returnSum
  return returnData
}

rxu.date = function(format) {
  var format = format || 'yyyy/mm/dd'
  var dateObj = new Date()
  var shortDate = ''
  switch(format) {
    case 'yyyy/mm/dd':
      var month = ('0' + (dateObj.getMonth() + 1)).slice(-2)
      var date = ('0' + dateObj.getDate()).slice(-2)
      var year = dateObj.getFullYear()
      shortDate = year + '/' + month + '/' + date
      break;

    case 'yyyy/mm/dd/hh/mm':
      var year = dateObj.getFullYear()
      var month = ('0' + (dateObj.getMonth() + 1)).slice(-2)
      var date = ('0' + dateObj.getDate()).slice(-2)
      var hour = ('0' + dateObj.getHours()).slice(-2)
      var minute = ('0' + dateObj.getMinutes()).slice(-2)
      shortDate = year + '/' + month + '/' + date + '/' + hour + '/' + minute
      break;

    default:
      shortDate = dateObj.getFullYear() + '/' + dateObj.getMonth() + '/' + dateObj.getDate()
    break;
  }

  return shortDate
}

rxu.signData = function(data, secret) {
    return jwt.sign(data, secret, {expiresIn: pri.jwtconf.tokenExpiresIn});
};

module.exports = rxu
