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

module.exports = QueueItem;
