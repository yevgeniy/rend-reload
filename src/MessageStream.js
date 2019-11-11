const { workgen } = require("./helpers");

class MessageStream {
  constructor(fn) {
    this._messages = [];

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
    this._messages.push(...message);
    this._onmessage && this._onmessage();
  }
  read() {
    return new Promise(res => {
      const work = () => {
        this._onmessage = null;
        if (!this._messages.length) this._onmessage = work;
        else {
          const m = this._messages.shift();
          res(m);
        }
      };
      work();
    });
  }
}

module.exports = {
  default: MessageStream,
  __esModule: true
};
