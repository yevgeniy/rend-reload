const { Builder, By, Key, until } = require("selenium-webdriver");

Array.prototype.findAsync = function(fn) {
  return new Promise(async res => {
    let x;
    for (x = 0; x < this.length; x++) {
      let item = this[x];
      let r = fn(item, x);
      if (r && r.then) r = await r;

      if (!!r) res(item);
    }
    res(null);
  });
};
Array.prototype.filterAsync = function(fn) {
  const out = [];
  return new Promise(async res => {
    let x;
    for (x = 0; x < this.length; x++) {
      let item = this[x];
      let r = fn(item, x);
      if (r && r.then) r = await r;

      if (!!r) out.push(item);
    }
    res(out);
  });
};

class Browser {
  constructor(driver) {
    this.driver = driver;
  }
  async get(...args) {
    return await this.driver.get(...args);
  }
  async quit() {
    return await this.driver.quit();
  }
  async back() {
    await this.driver.navigate().back();
  }

  async find(selector, regex) {
    var res = await this.driver.findElements(By.css(selector)).catch(e => {
      throw e;
    });

    regex &&
      (res = await res.filterAsync(v =>
        until.elementTextMatches(v, regex).fn()
      ));

    if (!res.length) return null;

    return new Element(this.driver, async () => {
      var res = await this.driver.findElements(By.css(selector)).catch(e => {
        throw e;
      });

      regex &&
        (res = await res.filterAsync(v =>
          until.elementTextMatches(v, regex).fn()
        ));

      return res[0];
    });
  }
  async findAll(selector) {
    var res = await this.driver.findElements(By.css(selector)).catch(e => {
      throw e;
    });

    res = res.map(
      (x, i) =>
        new Element(this.driver, async () => {
          return (
            await this.driver.findElements(By.css(selector)).catch(e => {
              throw e;
            })
          )[i];
        })
    );
    return res;
  }
}

class Element {
  constructor(driver, node) {
    this.driver = driver;
    this.node = node;
  }
  async contains(regex) {
    const r = await until.elementTextMatches(await this.node(), regex).fn();
    return !!r;
  }
  async click() {
    var element = await this.node();
    await element.click();
  }
  text() {
    return this.node().then(v => v.getText());
  }
  async hasLoaded() {
    return this.driver.executeScript(
      "return arguments[0].complete",
      await this.node()
    );
  }
  async find(selector, regex) {
    var res = await this.node()
      .then(v => v.findElements(By.css(selector)))
      .catch(e => {
        throw e;
      });

    regex &&
      (res = await res.filterAsync(v =>
        until.elementTextMatches(v, regex).fn()
      ));

    if (!res.length) return null;

    return new Element(this.driver, async () => {
      var res = await this.node()
        .then(v => v.findElements(By.css(selector)))
        .catch(e => {
          throw e;
        });

      regex &&
        (res = await res.filterAsync(v =>
          until.elementTextMatches(v, regex).fn()
        ));

      return res[0];
    });
  }
  async findAll(selector) {
    var res = await (await this.node())
      .findElements(By.css(selector))
      .catch(e => {
        throw e;
      });

    res = res.map(
      (x, i) =>
        new Element(this.driver, async () => {
          return (
            await (await this.node())
              .findElements(By.css(selector))
              .catch(e => {
                throw e;
              })
          )[i];
        })
    );
    return res;
  }
}

module.exports = Browser;
