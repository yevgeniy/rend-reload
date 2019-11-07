class ChannelStream {
  constructor() {
    this._messages = [];
  }
  push(message) {
    this._messages.push(message);
    this._onmessage && this._onmessage();
  }
  read() {
    return new Promise(res => {
      const work = () => {
        this._onmessage = null;
        if (!this._messages.length)
          this._onmessage = work;
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
  default: ChannelStream,
  __esModule:true
};
