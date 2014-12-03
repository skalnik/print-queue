require('./common/livestamp.min');
var io = require('./common/socket.io-1.2.1');

var listen = window.location.origin || (window.location.protocol + '//' + window.location.hostname + ':' + window.location.port);
var socket = io.connect(listen);

socket.on('job:change:status:done', function(data) {
  this.currentJob = ko.computed(function() {
    return ko.utils.arrayFilter(model.jobs(), function(Job) {
      return Job.key === data.index;
    });
  });

  this.currentJob()[0].status(data.status);
});

socket.on('job:notify:done', function(data) {
  console.log('got confirmation of notify change and email sent');
  this.currentJob = ko.computed(function() {
    return ko.utils.arrayFilter(model.jobs(), function(Job) {
      return Job.key === data.index;
    });
  });

  this.currentJob()[0].notified(true);
});

function AppViewModel() {
  var self = this;
  var observableList = []; 

  for (var i = 0; i < jobData.length; i ++) {
    var date = parseInt(jobData[i].date);
    jobData[i].humanDate = new Date(date);
    var status = jobData[i].status;
    var notified = jobData[i].notified;
    // make status observable
    jobData[i].status = ko.observable(status); 
    jobData[i].notified = ko.observable(notified); 
    observableList.push(jobData[i]); 
  }

  console.log(jobData);
      
  self.jobs = ko.observableArray(observableList);

  socket.on('job:new', function(data) {
    var date = parseInt(data.date);
    var status = data.status;
    var notified = data.notified;
    // make status observable
    data.status = ko.observable(status);
    data.humanDate = new Date(date);
    data.notified = ko.observable(notified);
    self.jobs.push(data);
  });

  self.toggle = function(status) {
    $('.'+status).toggle();
  }

  ko.bindingHandlers.statusChange = {
    init: function(element) {
      var statusInput = $(element);
     
      statusInput.change(function() {
        var data = {
          'index': $(this).attr('data-key'),
          'key': 'job~' + $(this).attr('data-key'),
          'status': $(this).val()
        };

        socket.emit('job:change:status', data);
      });
        
    }
  };

  ko.bindingHandlers.tooltip = {
    init: function(element, valueAccessor) {
      var local = ko.utils.unwrapObservable(valueAccessor()),
          options = {};

      ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
      ko.utils.extend(options, local);

      $(element).tooltip(options);

      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
          $(element).tooltip("destroy");
      });
    },
    options: {
        placement: "right",
        trigger: "click"
    }
  };

  self.notifyByEmail = function(job) {
    console.log(job.key, job.email);
    var data = {
      'index': job.key,
      'key': 'job~' + job.key,
      'email': job.email
    };

    socket.emit('job:notify', data);

    var currentJob = ko.computed(function() {
      return ko.utils.arrayFilter(model.jobs(), function(Job) {
        return Job.key === data.index;
      });
    });

    currentJob()[0].notified(true);
  };

}

var model = new AppViewModel();
ko.applyBindings(model);
