var $ = require('jquery');
var tipsy = require('tipsy-browserify')($);

$(function () {
  $('.tipsy-me').tipsy({ gravity: 's' });
});
