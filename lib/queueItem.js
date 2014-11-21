var validate = require('./validate.js');

// Prepares a new item for the queue
// Returns a queueItem object
function QueueItem(attributes) {
  var validStatus = validate(attributes);
  this.url = attributes.url;
  this.email = attributes.email;
  this.timestamp = attributes.timestamp || Date.now();
  this.id = attributes.id
  return this;
};

QueueItem.prototype.valid = function() {
  var validStatus = validate(this);
  return validStatus.valid;
}

QueueItem.prototype.errors = function() {
  var validStatus = validate(this);
  return validStatus.msgs;
}

module.exports = QueueItem;
