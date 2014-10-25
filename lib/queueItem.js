var validate = require('./validate.js');
var crypto = require('crypto');

// Prepares a new item for the queue
// Returns a queueItem object
function QueueItem(attributes) {
  var validStatus = validate(attributes);
  this.url = attributes.url;
  this.email = attributes.email;
  this.timestamp = attributes.timestamp || Date.now();
  if(attributes.id) {
    this.id = attributes.id
  }
  else {
    this.generateID();
  }
  return this;
};

QueueItem.prototype.generateID = function() {
  var sha1 = crypto.createHash('sha1');
  sha1.update(this.url);
  sha1.update(this.email);
  sha1.update(this.timestamp.toString());
  this.id = sha1.digest('hex');
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
