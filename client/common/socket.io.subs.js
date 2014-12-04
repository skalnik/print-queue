var io = require('./socket.io-1.2.1');
var ko = require('knockout');

module.exports = function(opts, model) {
  // set up socket.io
  var listen = window.location.origin || (window.location.protocol + '//' + window.location.hostname + ':' + window.location.port);
  var socket = io.connect(listen);

  // when the server emits that the job status update happened
  // data = {id: id, status: status}
  socket.on('job:update:done', function(data) {
    if (opts.updateStatus === false) return;

    var currentJob = ko.computed(function() {
      return ko.utils.arrayFilter(model.jobs(), function(Job) {
        return parseInt(Job.id) === parseInt(data.id);
      });
    });

    // check for empty result
    if (Object.keys(currentJob()).length) {
      currentJob()[0].status(data.status);
    }
    
  });

  // when the server emits that the notification of a user happened
  // id = just the id of the db entry/job
  socket.on('job:notify:done', function(id) {
    if (opts.jobNotify === false) return;

    var currentJob = ko.computed(function() {
        return ko.utils.arrayFilter(model.jobs(), function(Job) {
          return parseInt(Job.id) === parseInt(id);
        });
      });

    if (Object.keys(currentJob()).length) {
      currentJob()[0].notified(true);
    }

  });

  // when the server emits that the deletion of a queue item happened
  // id = just the id of the db entry/job
  socket.on('job:delete:done', function(id) {
    if (opts.jobDelete === false) return;

    // remove the job from the array
    model.jobs.remove(function(item) { return parseInt(item.id) === parseInt(id) })

  });

  // when server emits a new job happened
  socket.on('job:new', function(data) {
    if (opts.jobNew === false) return;

    var timestamp = parseInt(data.timestamp);
    var status = data.status;
    var notified = data.notified;

    // make status and notified observable
    data.status = ko.observable(status);
    data.notified = ko.observable(notified);
    model.jobs.push(data);
  });

};