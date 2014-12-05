require('./common/livestamp.min');
var $ = require('jquery');
var ko = require('knockout');
require('./common/knockout.bindings.orderable');
require('./common/knockout.bindings.tooltip');
var convertObservables = require('./common/knockout.convertObservables');
var io = require('./common/socket.io-1.2.1');


var model = new AppViewModel();

function AppViewModel() {
  var self = this;
  var observableList = []; 

  for (var i = 0; i < jobData.length; i ++) {
    // push the converted job to the queue observable list
    observableList.push(convertObservables(jobData[i]));
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
var opts = { jobChange: true, jobNew: true, jobDelete: true };
require('./common/socket.io.subs')(opts, model);