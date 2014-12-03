var http = require('http');

module.exports = function (app) {
  var user = require('./routes'),
    admin  = require('./routes/admin.js');

  app.use('/', user);
  app.use('/admin', admin);

  var server = http.createServer(app);

  server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });

  // set up socket io
  // globals are bad, but there's no other way to do this without 
  // creating express middleware to expose the socket to each route, which is a weird thing to do.
  global.socket = require('socket.io').listen(server);

};
