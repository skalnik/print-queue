var validator = require('validator');

// All possible statuses for a QueueItem to have. First is default
var VALID_STATUSES = ['submitted', 'queued', 'rejected', 'printed'];

// Prepares a new item for the queue
// Returns a queueItem object
var QueueItem = (function () {
  function QueueItem(attributes) {
    this.url = attributes.url;
    this.email = attributes.email;
    this.timestamp = attributes.timestamp || Date.now();
    this.status = attributes.status || VALID_STATUSES[0];
    this.id = attributes.id;
    this.valid = true;
    this.errors = [];

    this.validate();
  }

  QueueItem.prototype.validate = function() {
    this.valid = true;
    this.errors = [];
    if (!(this.url && this.email)) {
      this.valid = false;
      this.errors.push('URL & Email required');
    }
    if (!validator.isURL(this.url)) {
      this.valid = false;
      this.errors.push('URL is not valid');
    }
    if (!validator.isEmail(this.email)) {
      this.valid = false;
      this.errors.push('Email is not valid');
    }
    if (!(this.status && VALID_STATUSES.indexOf(this.status) !== -1)) {
      this.valid = false;
      this.errors.push('Unrecognized status!');
    }
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
