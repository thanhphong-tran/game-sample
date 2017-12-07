// Init one time
function rxPrivate() {}
var pri = rxPrivate;

pri.mgoconf   = {
  user: '',
  pass: '',
  host: '127.0.0.1',
  db:   'gamesamspledb',
  port: 27017
};

pri.scribeconf = {
  host: '127.0.0.1',
  port: 1463
};

pri.jwtconf = {
    'secret': 'gamesdk@6969~!~6969',
    'tokenExpiresIn': '30d'
};

pri.paymentconf = {
    product_id: 'LC07',
    product_key: '595b226a23061'
};

module.exports = pri;
