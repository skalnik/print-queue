require('./common/livestamp.min');
var jQuery = require('jquery');
var ko = require('knockout');
require('./common/knockout.bindings.orderable');

var $ = jQuery; 

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

  // filter for future
  self.toggle = function(status) {
    $('.'+status).toggle();
  }

  // this is for future thingiverse thumbnail tooltip
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

}

var model = new AppViewModel();
ko.applyBindings(model);

// set up socket subs
var opts = { updateStatus: true, jobNotify: true, jobnew: true };
require('./common/socket.io.subs')(opts, model);
