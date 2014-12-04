var validator = require('validator'),
  request = require('request'),
  redis = require('./redis'),
  watch = require('watchjs').watch;

// All possible statuses for a QueueItem to have. First is default
var VALID_STATUSES = ['submitted', 'queued', 'rejected', 'printed'];
// Redis key for our sorted set & counter
var KEY = "print-queue";

// Prepares a new item for the queue
// Returns a queueItem object
var QueueItem = (function () {
  function QueueItem(attributes) {
    this.id = attributes.id;
    this.url = attributes.url;
    this.email = attributes.email;

    this.timestamp = attributes.timestamp || Date.now();
    this.status = attributes.status || VALID_STATUSES[0];
    this.notified = attributes.notified || false;

    if(attributes.thumbnail || attributes.thumbnail === '') {
      this.thumbnail = attributes.thumbnail;
    } else {
      this.thumbnail = null;
      this.fetchThumbnailUrl();
    }

    this.valid = true;
    this.errors = [];
    this.validate();

    // keep an eye on the queueitem for changes
    watch(this, ['status', 'notified', 'url'], function(){
      // emit!!
      global.socket.emit('job:changed', this);
    });
  }

  QueueItem.prototype.validate = function () {
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

  QueueItem.prototype.save = function (callback) {
    var self = this;
    self.validate();
    if (!self.valid) {
      callback(new Error('Queue item is not valid!'));
    } else {
      redis.incr(KEY + ':id', function (err, id) {
        if (err) {
          callback(new Error('Could not get ID for saving: ' + err.message));
        } else {
          self.id = id;
          redis.zadd(KEY, id, JSON.stringify(self), function (err) {
            if (err) {
              callback(new Error('Could not save item: ' + err.message));
            } else {
              self.fetchThumbnailUrl();
              callback(null, self);
            }
          });
        }
      });
    }
  };

  QueueItem.prototype.fetchThumbnailUrl = function () {
    if (this.thumbnail || this.thumbnail === '') {
      return;
    }

    var self = this;
    console.log("Not set, so getting it");
    this.thumbnailUrl(function (thumbUrl) {
      QueueItem.update(self.id,
        { thumbnail: thumbUrl },
        function(err) {
          if (err) { console.log('Error unable to save thumb URL', err.message); }
        }
      );
    });
  };

  QueueItem.prototype.thumbnailUrl = function (callback) {
    var thingiverse = /thingiverse.com\/thing:(\d+)$/,
      matches;

    if (matches = thingiverse.exec(this.url)) {
      var url = 'https://api.thingiverse.com/things/' + matches[1] +
        '?access_token=' + process.env.THINGIVERSE_TOKEN;
      request.get(url, function (err, res, body) {
        var thing = JSON.parse(body);
        if (err) {
          console.log(err);
          callback('');
        } else if (!thing.thumbnail) {
          console.log('No thumbnail!');
          callback('');
        } else {
          console.log('Fetched', JSON.parse(body).thumbnail);
          callback(JSON.parse(body).thumbnail);
        }
      });
    } else {
      callback('');
    }
  };

  QueueItem.prototype.delete = function (callback) {
    console.log("Deleting ", this);
    redis.zremrangebyscore(KEY, this.id, this.id, function(err) {
      if (err) {
        callback(err);
      } else {
        callback();
      }
    });
  };

  return QueueItem;
}());

QueueItem.all = function (callback) {
  redis.zrange(KEY, 0, -1, function (err, queue) {
    if (err) {
      callback(err);
    } else {
      var queueItems = queue.map(function (item) {
        return new QueueItem(JSON.parse(item));
      });
      callback(null, queueItems);
    }
  });
};

QueueItem.find = function (itemId, callback) {
  redis.zrangebyscore(KEY, itemId, itemId, function (err, queueItems) {
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

QueueItem.update = function (itemId, newAttrs, callback) {
  QueueItem.find(itemId, function (err, queueItem) {
    if (err) {
      callback(err);
    } else {
      var updatedItem = new QueueItem(JSON.parse(JSON.stringify(queueItem))),
        objKey;

      for (objKey in updatedItem) {
        if (updatedItem.hasOwnProperty(objKey) &&
            newAttrs[objKey] !== null && newAttrs[objKey] !== undefined) {
          updatedItem[objKey] = newAttrs[objKey];
        }
      }

      updatedItem.validate();

      if (updatedItem.valid) {
        redis.multi()
          .zremrangebyscore(KEY, queueItem.id, queueItem.id)
          .zadd(KEY, updatedItem.id, JSON.stringify(updatedItem))
          .exec(function (err) {
            if (err) {
              callback(err);
            } else {
              callback();
            }
          });
      } else {
        callback(new Error('Item not valid!'));
      }
    }
  });
};

QueueItem.statuses = VALID_STATUSES;

module.exports = QueueItem;
