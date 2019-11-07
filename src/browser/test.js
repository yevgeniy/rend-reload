const browsersystem = require("./");
const { workgen } = require("../helpers");
const FS = require("fs");
const PATH = require("path");
const { default: ChannelStream } = require("./ChannelStream");

workgen(function*() {
  const browser = yield browsersystem.loggedInBrowser();
  const stream = new ChannelStream();
  watchStream(stream);

  while (true) {
    const fn = yield stream.read();

    try {
      const res = yield fn("hello");
    } catch (e) {
      console.log("ERROR", e);
    }
  }
});

function watchStream(stream) {
  let t;
  FS.watch(PATH.join(__dirname, "hot.js"), () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const fn = work();
      stream.push(fn);
    }, 1000);
  });
}
function work() {
  const data = FS.readFileSync(PATH.join(__dirname, "hot.js"), "utf8");
  var c = function*() {};
  const construct = c.constructor;

  const fn = new construct("browser", data);
  return fn;
}
