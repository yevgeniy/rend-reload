const { component } = require("nimm-react");
const com = require("./com");
const data = require("./data");

const datetime = +new Date();
module.exports = function() {
  return [component(data, { datetime }), component(com, { datetime })];
};
