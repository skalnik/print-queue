require('./common/livestamp.min');
var ko = require('knockout');
var convertObservables = require('./common/knockout.convertObservables');

var model = new AppViewModel();

function AppViewModel() {
  var self = this;
  var observableList = []; 

  for (var i = 0; i < jobData.length; i ++) {
    // push the converted job to the queue observable list
    observableList.push(convertObservables(jobData[i]));
  }

  self.email = email;
  self.jobs = ko.observableArray(observableList);
}

// bind everything
ko.applyBindings(model);

// set up socket subs
var opts = { jobChange: true, jobNew: false, jobDelete: false };
require('./common/socket.io.subs')(opts, model);