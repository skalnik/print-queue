var passwordless = require('passwordless'),
  RedisStore     = require('passwordless-redisstore'),
  email          = require('postmark')(process.env.POSTMARK_API_KEY),
  redisURL       = process.env.BOXEN_REDIS_URL || process.env.REDISCLOUD_URL || process.env.REDIS_URL,
  passwordlessStore;

if (redisURL) {
  var url = require('url').parse(redisURL),
    options = {};

  if (url.auth) {
    options = { auth_pass: url.auth.split(":")[1] };
  }

  passwordlessStore = new RedisStore(url.port, url.hostname, options);
} else {
  passwordlessStore = new RedisStore();
}

passwordless.init(passwordlessStore, { userProperty: 'itemId' });

module.exports = function (app) {
  passwordless.addDelivery(function (token, uid, recipient, callback) {
    var url, msg;
    url = app.get('host') + "/deleteItem/?token=" + token + "&uid=" + encodeURIComponent(uid);
    msg = {
      "From": "print.queue@mikeskalnik.com",
      "To": recipient,
      "Subject": "Your Print Queue Item Deletion URL",
      "TextBody": "Hello,\n\nTo delete your Print Queue item click here: " + url
    };
    email.send(msg, function (err) {
      if (err) {
        console.log("Failed to send message: ", msg);
        console.log(err);
      } else {
        console.log("Successfully sent message: ", msg);
      }
      callback();
    });
  });

  app.use(passwordless.sessionSupport());
  app.use(passwordless.acceptToken({ successRedirect: '/' }));
};
