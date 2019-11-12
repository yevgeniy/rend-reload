const { workgen } = require("./helpers");

class MessageStream {
  constructor(fn) {
    this._messages = [];
    this._requests = [];
    this._onread = [];

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
  pushUnique(...message) {
    message = message.filter(v => !this._messages.some(vv => vv === v));
    this.push(...message);
  }
  read() {
    this._onread.forEach(v => v());
    let message = this._messages.shift();

    if (message) return Promise.resolve(message);

    return new Promise(res => {
      this._requests.push(res);
    });
  }
  onRead(fn) {
    this._onread.push(fn);
    return () => {
      this._onread = this._onread.filter(v => v !== fn);
    };
  }
}

module.exports = {
  default: MessageStream,
  __esModule: true
};
