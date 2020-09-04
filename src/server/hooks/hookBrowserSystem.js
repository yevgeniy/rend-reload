const { useState, useEffect } = require("nimm-react");
const { workgen } = require("../../helpers");

let bp = null;
const useBrowserSystem = function() {
  let [b, setb] = useState(null);

  useEffect(() => {
    bp =
      bp ||
      (bp = new Promise(res => {
        var browsersystem = require("../../browser");

        workgen(function*() {
          yield browsersystem.init();
          yield browsersystem.login();

          res(browsersystem);
        });
      }));
    bp.then(setb);
  }, []);
  return b;
};

module.exports = {
  useBrowserSystem
};
