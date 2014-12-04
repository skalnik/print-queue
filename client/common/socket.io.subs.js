var io = require('./socket.io-1.2.1');
var ko = require('knockout');

module.exports = function(opts, model) {
  // set up socket.io
  var listen = window.location.origin || (window.location.protocol + '//' + window.location.hostname + ':' + window.location.port);
  var socket = io.connect(listen);

  // when the server emits that the deletion of a queue item happened
  // id = just the id of the db entry/job
  socket.on('job:delete', function(id) {
    if (opts.jobDelete === false) return;

    // remove the job from the array
    model.jobs.remove(function(item) { return parseInt(item.id) === parseInt(id) })

  });

  // when server emits a new job happened
  socket.on('job:new', function(data) {
    if (opts.jobNew === false) return;

    // cache the bloody hell out of the bits
    var timestamp = parseInt(data.timestamp);
    var status = data.status;
    var notified = data.notified;
    var url = data.url;
    var thumbnail = data.thumbnail;

    // make status, notified, url, and thumbnail observable
    data.status = ko.observable(status);
    data.notified = ko.observable(notified);
    data.url = ko.observable(url);
    data.thumbnail = ko.observable(thumbnail);

    model.jobs.push(data);
  });

  // when server emits a new job happened
  socket.on('job:changed', function(data) {
    if (opts.jobChange === false) return;
    console.log('job:changed!', data);

    var currentJob = ko.computed(function() {
      return ko.utils.arrayFilter(model.jobs(), function(Job) {
        return parseInt(Job.id) === parseInt(data.id);
      });
    });

    // check for empty result
    if (Object.keys(currentJob()).length) {
      var cJob = currentJob()[0];
      // these need to be updated manually because they're observables and you can't overwrite them with native values
      // or they won't be observable anymore
      // a for loop after a comparison of each would work too
      cJob.notified(data.notified);
      cJob.status(data.status);
      cJob.url(data.url);
      cJob.thumbnail(data.thumbnail);
    }
  });

};