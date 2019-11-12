const { workgen } = require("./helpers");

class MessageStream {
  constructor(fn) {
    this._messages = [];
    this._requests = [];

    fn && this.workgen(fn);
  }
  async workgen(fn) {
    let gen = fn();
    while (true) {
      let step = gen.next();
      let { value: data, done } = step;
      if (data && data.then) data = await data;
      this.push(data);

      if (done) break;
    }
  }
  push(...message) {
    let m;
    while ((m = message.shift())) {
      let request = this._requests.shift();
      if (request) {
        request(m);
        continue;
      }

      this._messages.push(m);
    }
  }
  read() {
    let message = this._messages.shift();

    if (message) return Promise.resolve(message);

    return new Promise(res => {
      this._requests.push(res);
    });
  }
}

module.exports = {
  default: MessageStream,
  __esModule: true
};
