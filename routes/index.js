var express = require('express');
var router = express.Router();
var QueueItem = require('../lib/queueItem.js');
var passwordless = require('passwordless');

router.get('/', function (req, res) {
  var locals = {
    queue: [],
    errors: req.flash('errors'),
    message: req.flash('message')[0],
    queueItem: req.flash('queueItem')[0],
    email: req.user,
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
    queueItem.save(function (err, data) {
      if (err) { req.flash('errors', [err.message]); }
      // emit!!
      global.socket.emit('job:new', data);

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

router.get('/queue/:itemId', passwordless.restricted(), function (req, res) {
  QueueItem.find(req.params.itemId, function (err, queueItem) {
    if (err) {
      req.flash('errors', [err.message]);
      res.redirect('/');
    } else {
      if (queueItem.email !== req.user) {
        req.flash('errors', ['Not authorized to do that!']);
        res.redirect('/login');
      } else {
        req.flash('queueItem', queueItem);
        res.redirect('/');
      }
    }
  })
});

router.patch('/queue/:id', function (req, res) {
  var itemId = req.params.id,
    newAttrs = req.body.queue,
    i;

  QueueItem.find(itemId, function (err, queueItem) {
    if (err) {
      req.flash('errors', [err.message]);
      res.redirect('/');
    } else {
      if (queueItem.email !== req.user) {
        req.flash('errors', ['Not authorized to do that!']);
        res.redirect('/login');
      } else {
        QueueItem.update(itemId, newAttrs, function (err) {
          if (err) {
            req.flash('errors', [err.message]);
          } else {
            req.flash('message', 'Item updated!');
          }
          res.redirect('/');
        });
      }
    }
  });
});

router.delete('/queue/:itemId', passwordless.restricted(), function (req, res) {
  QueueItem.find(req.params.itemId, function (err, queueItem) {
    if (err) {
      req.flash('errors', [err.message]);
      res.redirect('/');
    } else {
      if (queueItem.email !== req.user) {
        req.flash('errors', ['Not authorized to do that!']);
        res.redirect('/login');
      }
      queueItem.delete(function (err) {
        if (err) {
          req.flash('errors', [err.message]);
        } else {
          global.socket.emit('job:delete', req.params.itemId);
          req.flash('message', 'Item deleted!');
        }
        res.redirect('/');
      });
    }
  });
});

module.exports = router;
