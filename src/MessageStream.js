const { workgen } = require("./helpers");

class MessageStream {
  constructor(fn) {
    this._messages = [];
    this._requests = [];
    this._onread = [];
    this.kill = function() {};
    this.onkillfns = [];

    fn && this.workgen(fn);
  }
  async workgen(fn) {
    if (
      fn.constructor.name === "GeneratorFunction" ||
      fn.constructor.name === "AsyncGeneratorFunction"
    ) {
      const w = workgen(
        fn(
          data => {
            this.push(data);
          },
          fn => this.onkillfns.push(fn)
        )
      );

      this.kill = () => {
        this.onkillfns.forEach(v => v());
        w.kill();
      };
    } else {
      fn(
        data => {
          this.push(data);
        },
        fn => this.onkillfns.push(fn)
      );
    }
  }
  push(...message) {
    let m;
    while (message.length > 0) {
      m = message.shift();
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

    if (this._messages.length > 0) {
      let message = this._messages.shift();
      return new Promise(res => res(message));
    }

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
