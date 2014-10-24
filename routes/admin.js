var express = require('express');
var router = express.Router();
var auth = require('basic-auth');
var clearQueue = require('../lib/clearQueue.js');
var getQueue = require('../lib/getQueue.js');
var removeItem = require('../lib/removeItem.js');

router.all('*', function(req, res, next) {
  user = auth(req);
  if (user === undefined || user['pass'] !== req.password) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
      res.end('Unauthorized');
  } else {
    next();
  }
});

router.get('/', function(req, res) {
  getQueue(req.db, res, function(queue) {
    res.render('admin', { queue: queue });
  });
});

router.delete('/queue', function(req, res) {
  queue = clearQueue(req.db, res);
  res.redirect('/admin');
});

router.delete('/queue/:id', function(req, res) {
  console.log("Cockass: ", req.params.id)
  var id = req.params.id;
  var item = removeItem(req.db, res, id);
  res.redirect('/admin');
});

module.exports = router;
