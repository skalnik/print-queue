getQueue = require('./getQueue.js');
indexOfItem = require('./indexOfItem.js');

module.exports = function(db, res, id) {
  var item = null;
  getQueue(db, res, function(queue) {
    index = indexOfItem(db, res, id);
    if(index > -1) {
      item = queue.splice(index, 1)
    }
  });
  return item;
};
