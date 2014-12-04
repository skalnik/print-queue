require('./common/livestamp.min');
var $ = require('jquery');
var ko = require('knockout');
require('./common/knockout.bindings.orderable');
require('./common/knockout.bindings.tooltip');
var io = require('./common/socket.io-1.2.1');

var model = new AppViewModel();

function AppViewModel() {
  var self = this;
  var observableList = []; 

  for (var i = 0; i < jobData.length; i ++) {

    // cache the bloody hell out of the bits
    var status = jobData[i].status;
    var notified = jobData[i].notified;
    var url = jobData[i].url;
    var thumbnail = jobData[i].thumbnail;

    // make status, notified, url, and thumbnail observable
    jobData[i].status = ko.observable(status); 
    jobData[i].notified = ko.observable(notified); 
    jobData[i].url = ko.observable(url);
    jobData[i].thumbnail = ko.observable(thumbnail);

    // push the job to the queue observable list
    observableList.push(jobData[i]);
  }
      
  self.jobs = ko.observableArray(observableList);
  self.possibleStatuses = possibleStatuses;

}

// filter table rows
model.toggle = function(status) {
  $('.'+status).toggle();
}

// bind everything
ko.applyBindings(model);

// set up socket subs
var opts = { jobChange: true, jobNew: true };
require('./common/socket.io.subs')(opts, model);