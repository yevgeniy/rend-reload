const {root,component} = require('nimm-react');
const app = require('./app');

module.exports = function() {
  require('./helpers');

  root(component(app))
};
