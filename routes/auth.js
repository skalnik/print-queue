var router = require('express').Router(),
  passwordless = require('passwordless');

router.get('/login', function (req, res) {
  res.render('login');
});

router.get('/logout', passwordless.logout(), function (req, res) {
  req.flash('message', 'Logged out');
  res.redirect('/');
});

router.post('/requestToken', passwordless.requestToken(function (email, delivery, callback, req) {
    callback(null, email);
  }), function (req, res) {
  req.flash('message', 'Check your email for sign in instructions');
  res.redirect('/');
});


module.exports = router;
