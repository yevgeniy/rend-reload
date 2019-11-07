const browsersystem = require("./");

const { workgen } = require("../helpers");
const FS = require("fs");
const PATH = require("path");
const { default: ChannelStream } = require("./ChannelStream");

workgen(function*() {
  const browser = yield browsersystem.loggedInBrowser();
  const stream = new ChannelStream();
  let w;
  watchStream(stream);

  while (true) {
    const fn = yield stream.read();

    try {
console.log('killing')      
      w && w.kill();


      w=workgen(fn([workgen, browser, browsersystem.Key, x=>console.log(x)]))
      w.catch(e=>{throw e;});
      w.then(v=>console.log(v))
    } catch (e) {
      w=null;
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

  try {
    const fn = new construct("args", data);
    return fn;
  } catch(e) {
    console.log('bad hot.js')
  }
  
  
}
