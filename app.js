// Variables
var sTime      = 0;
var http       = require('http');
var path       = require('path');
var url        = require('url');
var formidable = require('formidable');
var fs         = require('fs');
var mongoose   = require('mongoose');

mongoose.Promise = global.Promise;

global.basedir = __dirname;
global.baseapp = global.basedir + '/app/';
global.baseup  = global.basedir + '/upload/';
global.baseup_img = global.baseup + 'image/';


global.pri     = require(global.baseapp + 'include/rxPrivate.js');
global.rxu     = require(global.baseapp + 'include/rxUtil.js');
global.rxController = require(global.baseapp + 'include/rxController.js');


process.on('uncaughtException', function (err) { if (err.message != 'Early exit') { console.log('Caught exception: ' + err); }});
var server = http.createServer(function (req, res) {

  var isStatic = serverStaticFiles(req, res);
  if (!isStatic) {
    resEnrich(req, res, function(data) {

      // Log request info
      console.log(data.method, data.pathname, data.params);

      res.data = data;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-Access-Token, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
      var whiteList = [];
      var routes    = [];

      // If not in whitelist
      if (typeof(whiteList[0]) !== 'undefined' && whiteList.indexOf(res.data.controller) == -1) {
        res.data.response({success: -1, msg: 'Not support'});
      }

      // Prepair controller to run
      controllerFile = global.baseapp + 'controllers/' + '/' + res.data.version + '/' + res.data.controller + 'Controller.js';

      // Try handle request
      try {
        var actionName       = (req.method == 'GET') ? res.data.action : req.method + res.data.action;
        var controllerObj    = new(require(controllerFile))(res);
        controllerObj[actionName]();
      } catch (err) {
        //console.log(err);
        //res.data.response({success: -1, msg: 'Not support', exit: false});
        if (err.code == 'MODULE_NOT_FOUND' || err.message === 'controllerObj[actionName] is not a function') {
            res.end({success: -1, msg: 'Not support'});
        } else {
            res.end({success: -1, msg: err.message});
            throw err;
        }
      }
    });
  }
}).listen(8081);
server.timeout = 4000;

var resEnrich = function(req, res, callback) {
  var data = {};
  data.req = req;
  data.url = url;
  data.startTime  = rxu.now();

  // Request related
  data.hostname   = req.headers.host;
  data.pathinfo   = url.parse(req.url, true);
  data.pathname   = data.pathinfo.pathname;
  data.allpath    = data.pathname.split('/');
  data.version    = data.allpath[1];
  data.method     = req.method;
  data.controller = (typeof(data.allpath[2]) !== 'undefined') ? data.allpath[2] : 'index';
  data.action     = (typeof(data.allpath[3]) !== 'undefined') ? data.allpath[3] : 'index';
  data.response   = function(options) {
    var tempData = {};
    var options  = options || {};
    var exit     = options.exit || true;

    tempData.success = options.success || 1;
    tempData.msg     = options.msg     || 'Request success!';
    tempData.data    = options.data    || {};
    tempData.cpu     = (rxu.now() - data.startTime).toString().substr(0, 8) + 'ms';
    var returnData   = JSON.stringify(tempData);
    res.writeHead(200);
    if (exit) {
      res.end(returnData);

      // this is for ealy exit
      throw new Error('Early exit');
    } else {
      res.write(returnData);
    }
  };

  // Request params
  if (data.method === 'GET') {
    data.params = data.pathinfo.query;
    callback(data);
  } else {
    var form = new formidable.IncomingForm();
    form.uploadDir = global.baseup + 'temp/';
    form.parse(req, function(err, fields, files) {
      data.params = fields;
      // Add get params
      for (var key in data.pathinfo.query) {
          data.params[key] = data.pathinfo.query[key];
      }
      data.files  = files;
      data.form   = form;
      callback(data);
    });
  }

  // Return
  return data;
};

var serverStaticFiles = function(request, response) {
  var filePath = '.' + request.url;
  if (filePath == './') filePath = './index.html';

  var isStatic = false;
  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
      case '.html':
          isStatic = true;
          contentType = 'text/html';
          break;
      case '.ico':
          isStatic = true;
          contentType = 'image/x-icon';
          break;
      case '.js':
          isStatic = true;
          contentType = 'text/javascript';
          break;
      case '.css':
          isStatic = true;
          contentType = 'text/css';
          break;
      case '.json':
          isStatic = true;
          contentType = 'application/json';
          break;
      case '.png':
          isStatic = true;
          contentType = 'image/png';
          break;
      case '.jpg':
          isStatic = true;
          contentType = 'image/jpg';
          break;
      case '.wav':
          isStatic = true;
          contentType = 'audio/wav';
          break;
  }

  if (isStatic) {
    fs.readFile(filePath, function(error, content) {
      if (error) {
          if(error.code == 'ENOENT'){
              fs.readFile('./404.html', function(error, content) {
                  response.writeHead(200, { 'Content-Type': contentType });
                  response.end(content, 'utf-8');
              });
          }
          else {
              response.writeHead(500);
              response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
              response.end();
          }
      }
      else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
      }
    });

    return true;
  }

  return false;
};
