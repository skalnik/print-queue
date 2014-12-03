require('./common/livestamp.min');
var jQuery = require('jquery');
var io = require('./common/socket.io-1.2.1');
var ko = require('knockout');


var listen = window.location.origin || (window.location.protocol + '//' + window.location.hostname + ':' + window.location.port);
var socket = io.connect(listen);

console.log(jobData);

// when the server emits that the job status update happened
// data = {id: id, status: status}
socket.on('job:update:done', function(data) {
  console.log('confirmation of job update', data);
  this.currentJob = ko.computed(function() {
    return ko.utils.arrayFilter(model.jobs(), function(Job) {
      return Job.id === data.id;
    });
  });

  this.currentJob()[0].status(data.status);
});

// when the server emits that the notification of a user happened
socket.on('job:notify:done', function(id) {
  console.log('got confirmation of notify change and email sent', id);
  this.currentJob = ko.computed(function() {
    return ko.utils.arrayFilter(model.jobs(), function(Job) {
      return Job.id === id;
    });
  });

  this.currentJob()[0].notified(true);
});

function AppViewModel() {
  var self = this;
  var observableList = []; 

  for (var i = 0; i < jobData.length; i ++) {
    var status = jobData[i].status;
    var notified = jobData[i].notified;
    // make status and notified observable
    jobData[i].status = ko.observable(status); 
    jobData[i].notified = ko.observable(notified); 
    // push the job to the queue observable list
    observableList.push(jobData[i]);
  }
      
  self.jobs = ko.observableArray(observableList);

  socket.on('job:new', function(data) {
    console.log("new jerb!", data);
    var timestamp = parseInt(data.timestamp);
    var status = data.status;
    var notified = data.notified;

    // make status and notified observable
    data.status = ko.observable(status);
    data.notified = ko.observable(notified);
    self.jobs.push(data);
  });

  self.toggle = function(status) {
    $('.'+status).toggle();
  }

  // ko.bindingHandlers.statusChange = {
  //   init: function(element) {
  //     var statusInput = $(element);
     
  //     statusInput.change(function() {
  //       var data = {
  //         'id': $(this).attr('data-id'),
  //         'status': $(this).val()
  //       };

  //       socket.emit('job:change:status', data);
  //     });
        
  //   }
  // };

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

  // self.notifyByEmail = function(job) {
  //   console.log(job.id, job.email);
  //   var data = {
  //     'id': job.id,
  //     'email': job.email
  //   };

  //   socket.emit('job:notify', data);

  //   var currentJob = ko.computed(function() {
  //     return ko.utils.arrayFilter(model.jobs(), function(Job) {
  //       return Job.key === data.index;
  //     });
  //   });

  //   currentJob()[0].notified(true);
  // };

}

var model = new AppViewModel();
ko.applyBindings(model);
