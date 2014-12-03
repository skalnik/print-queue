var express = require('express'),
  email = require('postmark')(process.env.POSTMARK_API_KEY),
  auth = require('basic-auth'),
  router = express.Router(),
  QueueItem = require('../lib/queueItem.js');

router.all('*', function (req, res, next) {
  var user = auth(req);
  if (user === undefined || user.pass !== req.password) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
    res.end('Unauthorized');
  } else {
    next();
  }
});

router.get('/', function (req, res) {
  var locals = {
    queue            : [],
    errors           : req.flash('errors'),
    message          : req.flash('message')[0],
    possibleStatuses : QueueItem.statuses
  };

  QueueItem.all(function (err, queue) {
    if (err) {
      locals.errors.push(err.message);
    } else {
      locals.queue = queue;
    }
    res.render('admin', locals);
  });
});

router.post('/notify/:id', function (req, res) {
  var itemId = req.params.id;
  QueueItem.find(itemId, function (err, queueItem) {
    if (err) {
      req.flash('errors', [err.message]);
      res.redirect('/admin');
    } else {
      if (queueItem.notified) {
        req.flash('errors', ['User already notified']);
        res.redirect('/admin');
      } else {
        var msg = {
          "From": "print.queue@mikeskalnik.com",
          "To": queueItem.email,
          "Subject": "Your 3d printed things are ready!",
          "TextBody": "Hello,\n\nThe 3d printed items you have requested have been printed!" +
            "\nPlease come pick them up :)"
        };
        email.send(msg, function (err) {
          if (err) {
            req.flash('errors', ['Could not sent message!']);
            console.log("Failed to send message: ", msg);
            console.log(err);
          } else {
            req.flash('message', 'Email sent');
            console.log("Successfully sent message: ", msg);
          }
          QueueItem.update(itemId, { notified: true }, function (err) {
            if (err) { req.flash('errors', ['Could not update item: ' + err.message]); }
            res.redirect('/admin');
          });
        });
      }
    }
  });
});

router.patch('/queue/:id', function (req, res) {
  var itemId = req.params.id,
    attrList = Object.keys(new QueueItem({})),
    newAttrs = {},
    i;

  for (i = 0; i < attrList.length; i++) {
    if (req.param(attrList[i])) {
      newAttrs[attrList[i]] = req.param(attrList[i]);
    }
  }

  QueueItem.update(itemId, newAttrs, function (err) {
    if (err) {
      req.flash('errors', [err.message]);
    } else {
      req.flash('message', 'Item updated!');
    }
    res.redirect('/admin');
  });
});

router.delete('/queue/:id', function (req, res) {
  var itemId = req.params.id;
  QueueItem.find(itemId, function (err, queueItem) {
    if (err) {
      req.flash('errors', [err.message]);
      res.redirect('/admin');
    } else {
      queueItem.delete(function (err) {
        if (err) {
          req.flash('errors', [err.message]);
        } else {
          req.flash('message', 'Queue item deleted!');
        }
        res.redirect('/admin');
      });
    }
  });
});

module.exports = router;
