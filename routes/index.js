var express = require('express');
var router = express.Router();
var QueueItem = require('../lib/queueItem.js');
var passwordless = require('passwordless');

router.get('/', function (req, res) {
  var locals = { queue: [], errors: req.flash('errors'), message: req.flash('message')[0] };
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

router.get('/login', function(req, res) {
  res.render('login', {});
})

router.post('/requestToken', passwordless.requestToken(function (email, delivery, callback, req) {
  QueueItem.find(req.param('itemId'), function (err, queueItem) {
    if (err) {
      callback(err, null);
    } else {
      if (queueItem.queued) {
        callback(new Error("Can't delete a queued item!"), null);
      } else {
        callback(null, queueItem.id);
      }
    }
  });
}), function (req, res) {
  req.flash('message', 'Check your email for deletion instructions');
  res.redirect('/');
});

router.get('/deleteItem', passwordless.acceptToken(), function (req, res) {
  var itemId = req.itemId;
  if (itemId) {
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
  } else {
    req.flash('errors', ['Could not authenticate successfully']);
    res.redirect('/');
  }
});

module.exports = router;
