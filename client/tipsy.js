var $ = require('jquery');
var tipsy = require('tipsy-browserify')($);

$(function () {
  $('form.delete input[type=submit]').tipsy({ gravity: 'e' });
});
