module.exports = {
  equal: function (a, b, options) {
    if (a === b) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  json: function (context) {
    return JSON.stringify(context);
  },

  prepareTime: function(timestamp) {
    return timestamp / 1000;
  }
};
