require('./common/livestamp.min');
var ko = require('knockout');

var model = new AppViewModel();

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

  self.email = email;
  self.jobs = ko.observableArray(observableList);
}

// bind everything
ko.applyBindings(model);

// set up socket subs
var opts = { updateStatus: true, jobNotify: false, jobNew: false, jobDelete: false };
require('./common/socket.io.subs')(opts, model);