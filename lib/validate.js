var validator = require('validator');
// Validate an item to be added to the queue
// Requires queueItem to have a valid email and URL
//
// Returns an object with boolean variable `valid`, and a list of messages (`msgs`) if
// needed
module.exports = function (queueItem) {
  var validated = { valid: true, msgs: [] };
  if (!(queueItem.url && queueItem.email)) {
    validated.valid = false;
    validated.msgs.push('URL & Email required');
  }
  if (!validator.isURL(queueItem.url)) {
    validated.valid = false;
    validated.msgs.push('URL is not valid');
  }
  if (!validator.isEmail(queueItem.email)) {
    validated.valid = false;
    validated.msgs.push('Email is not valid');
  }
  return validated;
};
