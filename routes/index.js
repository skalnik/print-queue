var express = require('express');
var router = express.Router();
var QueueItem = require('../lib/queueItem.js');
var passwordless = require('passwordless');

router.get('/', function (req, res) {
  var locals = {
    queue: [],
    errors: req.flash('errors'),
    message: req.flash('message')[0],
    email: req.user
  };

  QueueItem.all(function (err, queue) {
    if (err) {
      locals.errors.push(err.message);
    } else {
      locals.queue = queue;
    }
    res.render('index', locals);
  });
});

router.post('/', function (req, res) {
  var errors = [],
    queueItem = new QueueItem(req.body.queue),
    errMsgs = queueItem.errors,
    i;
  if (queueItem && queueItem.valid) {
    queueItem.save(function (err) {
      if (err) { req.flash('errors', [err.message]); }
      res.redirect('/');
    });
  } else {
    for (i = 0; i < errMsgs.length; i++) {
      errors.push(errMsgs[i]);
    }
    req.flash('errors', errors);
    res.redirect('/');
  }
});

router.delete('/queue/:itemId', function (req, res) {
  QueueItem.find(req.params.itemId, function (err, queueItem) {
    if (err) {
      req.flash('errors', [err.message]);
      res.redirect('/');
    } else {
      queueItem.delete(function (err) {
        if (err) {
          req.flash('errors', [err.message]);
        } else {
          req.flash('message', 'Item deleted!');
        }
        res.redirect('/');
      });
    }
  });
});

module.exports = router;
