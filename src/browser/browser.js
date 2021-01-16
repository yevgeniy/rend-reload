const { Builder, By, Key, until } = require("selenium-webdriver");
const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");
const CONFIG = require("config");

var PATH = require("path");
var FS = require("fs");

if (!Promise.delay)
  Promise.delay = function(ms) {
    return new Promise(res => {
      setTimeout(() => res(), ms);
    });
  };

class Browser {
  constructor(driver) {
    this.driver = driver;

    this.builder = new Promise(async res => {
      await this.driver.manage().setTimeouts({
        pageLoad: 500
      });

      res(this.driver);
    });

    this.ready = false;
  }
  static async init() {
    if (process.platform === "darwin") {
      let driver = new webdriver.Builder().forBrowser("firefox").build();
      driver = await driver;
      return driver;
    } else if (process.platform == "linux") {
      var service = new firefox.ServiceBuilder(
        PATH.join(__dirname, "../geckodriver_linux_32")
      ).build();
      var options = new firefox.Options();
    } else {
      var service = new firefox.ServiceBuilder(
        PATH.join(__dirname, "../geckodriver.exe")
      ).build();
      var options = new firefox.Options();
    }
    //options.setBinary(CONFIG["mozilla-executable"]);
    return firefox.Driver.createSession(options, service);

    /*
		if (process.platform=='linux') {
			return await wait(()=>{
					return new webdriver.Builder()
						.forBrowser('firefox')
						.usingServer('http://ffdriver:4444/wd/hub')
						.build();
				},10000);
		} else {
			var service = new firefox.ServiceBuilder(PATH.join(__dirname, '../geckodriver.exe')).build();
			var options = new firefox.Options();
			options.setBinary(CONFIG['mozilla-executable']);
			return firefox.Driver.createSession(options, service);
		}
		*/
  }

  async executeScript(s, ...args) {
    var driver = await this.builder;
    return await driver.executeScript(s, ...args);
  }
  async render(path) {
    var driver = await this.builder;
    return new Promise(res => {
      driver.takeScreenshot().then((image, err) => {
        require("fs").writeFileSync(path, Buffer.from(image, "base64"));
        res();
      });
    });
  }

  async url() {
    var driver = await this.builder;
    return driver.getCurrentUrl();
  }

  navigate(arg) {
    var navprom = new Promise(async res => {
      var driver = await this.builder;

      var donav =
        arg.constructor == String
          ? () => {
              driver.get(arg);
            }
          : arg;

      await driver.executeScript("document._navaway=true");
      try {
        donav()
          .then(() => res(driver))
          .catch(() => {});
      } catch (e) {}

      res(driver);
    });

    return {
      start: () =>
        new Promise(async res => {
          var driver = await navprom;
          await this.when("return !document._navaway");
          res();
        }),
      ready: () =>
        new Promise(async res => {
          var driver = await navprom;
          await this.when(
            'return !document._navaway && (document.readyState=="interactive" || document.readyState=="complete")'
          );
          res();
        }),
      load: () =>
        new Promise(async res => {
          var driver = await navprom;
          await this.when(
            'return !document._navaway && document.readyState=="complete"'
          );
          res();
        })
    };
  }

  async find(selector) {
    var driver = await this.builder;
    var res = await driver.findElements(By.css(selector)).catch(e => {
      throw e;
    });
    if (!res.length) return null;
    return new Element(res[0]);
  }
  async findAll(selector) {
    var driver = await this.builder;
    var res = await driver.findElements(By.css(selector));
    return res.map(x => new Element(x));
  }

  async when(script, args, waitfor) {
    var driver = await this.builder;

    var ti = +new Date();
    return new Promise(res => {
      (async function work() {
        var r = await driver.executeScript(script);

        if (r) res();
        else {
          if (+new Date() - ti > waitfor) {
            res();
          } else {
            setTimeout(work, 1000);
          }
        }
      })();
    });
  }

  async quit() {
    this.builder.quit();
  }
}
class Element {
  constructor(e) {
    this.node = e;
  }
  async click() {
    await this.node.click();
  }
  async sendKeys(n) {
    await this.node.sendKeys(n);
  }
}

function wait(fn, dur) {
  var ti = +new Date();
  return new Promise(res => {
    (async function work() {
      try {
        var r = fn();
        if (r && r.then) r = await r;
      } catch (e) {
        if (+new Date() - ti > dur) {
          res(r);
          return;
        }

        setTimeout(work, 1000);
        return;
      }

      if (r) res(r);
      else {
        if (+new Date() - ti > dur) {
          res(r);
          return;
        }

        setTimeout(work, 1000);
      }
    })();
  });
}

module.exports = {
  Browser,
  Element
};
