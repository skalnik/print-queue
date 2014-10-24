getQueue = require('./getQueue.js');

module.exports = function(db, res, id) {
  var index = -1
  getQueue(db, res, function(queue) {
    var length = queue.length
    for(var i = 0; i < length; i++) {
      if(queue[i].id == id) {
        index = i
      }
    }
  });
  return index;
};
