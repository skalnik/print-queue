var io = require('./socket.io-1.2.1');
var ko = require('knockout');
var convertObservables = require('./knockout.convertObservables');

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

    model.jobs.push(convertObservables(data));
  });

  // when server emits a job change has happened
  socket.on('job:changed', function(data) {
    if (opts.jobChange === false) return;

    // pull out data item with matching id
    var currentJob = ko.computed(function() {
      return ko.utils.arrayFilter(model.jobs(), function(Job) {
        return parseInt(Job.id) === parseInt(data.id);
      });
    });

    // check for empty result
    if (Object.keys(currentJob()).length) {
      var cJob = currentJob()[0];
      var observables = ['notified', 'status', 'url', 'thumbnail', 'amount', 'notes'];

      // return any keys that have changed value
      var changedKeys = observables.filter(function(key) {
        return cJob[key]().toString() !== data[key].toString();
      });

      // these need to be updated manually because they're observables and you can't overwrite them with native values
      // or they won't be observable anymore
      // loop though the changed keys and assign updated values
      for (var i = 0; i < changedKeys.length; i++) {
        var ck = changedKeys[i];
        var newVal = data[ck];
        // change observable val to new one
        cJob[ck](newVal);
      }

    }
  });

};