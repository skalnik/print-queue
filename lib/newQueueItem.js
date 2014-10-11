var validate = require('./validate.js');
var crypto = require('crypto');

// Prepares a new item for the queue
// Returns a queueItem object
module.exports = function newQueueItem(reqObject) {
  var validStatus = validate(reqObject);
  var queueItem = {
    url: reqObject.url,
    email: reqObject.email,
    timestamp: Date.now(),
    valid: validStatus.valid,
    errors: validStatus.msgs
  };
  queueItem.id = generateId(queueItem);
  return queueItem;
};

function generateId(queueItem) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(queueItem.url);
  sha1.update(queueItem.email);
  sha1.update(queueItem.timestamp.toString());
  return sha1.digest('hex');
}
