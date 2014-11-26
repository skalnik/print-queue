var validate = require('./validate.js');

// Prepares a new item for the queue
// Returns a queueItem object
var QueueItem = (function () {
  function QueueItem(attributes) {
    this.validStatus = validate(attributes);
    this.url = attributes.url;
    this.email = attributes.email;
    this.timestamp = attributes.timestamp || Date.now();
    this.id = attributes.id;
  }

  QueueItem.prototype.valid = function () {
    return this.validStatus.valid;
  };

  QueueItem.prototype.errors = function () {
    return this.validStatus.msgs;
  };

  return QueueItem;
}());

QueueItem.find = function (redis, key, itemId, callback) {
  redis.zrangebyscore(key, itemId, itemId, function (err, queueItems) {
    if (err) {
      callback(err, undefined);
    } else {
      if (queueItems.length > 1) {
        callback(new Error('More than 1 queue item for that ID!'), undefined);
      } else {
        callback(undefined, new QueueItem(JSON.parse(queueItems[0])));
      }
    }
  });
};

module.exports = QueueItem;
