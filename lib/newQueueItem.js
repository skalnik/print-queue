var moment = require('moment');
var validate = require('./validate.js');

// Prepares a new item for the queue
// Returns a queueItem object
module.exports = function newQueueItem(reqObject) {
  validStatus = validate(reqObject);
  var queueItem = {
    url: reqObject.url,
    email: reqObject.email,
    timestamp: moment().format(),
    valid: validStatus.valid,
    errors: validStatus.msgs
  };
  return queueItem;
};
