var http = require('http');

module.exports = function (app) {
  var user = require('./routes'),
    auth   = require('./routes/auth.js');
    admin  = require('./routes/admin.js');

  app.use('/', user);
  app.use('/', auth);
  app.use('/admin', admin);

  http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
};
