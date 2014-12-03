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

router.get('/login', function (req, res) {
  res.render('login');
});

router.get('/logout', passwordless.logout(), function (req, res) {
  req.flash('message', 'Logged out');
  res.redirect('/');
});

// Allow any email address to log in
router.post('/requestToken', passwordless.requestToken(function (email, delivery, callback, req) {
    callback(null, email);
  }), function (req, res) {
  req.flash('message', 'Check your email for sign in instructions');
  res.redirect('/');
});

router.delete('/queue/:itemId', function (req, res) {
  QueueItem.find(itemId, function (err, queueItem) {
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
