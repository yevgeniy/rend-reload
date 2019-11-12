const { Key } = require("selenium-webdriver");
var W = require("nimm-warden").Warden;
const { default: MessageStream } = require("../MessageStream");
const { workgen } = require("../helpers");

var Browser = require("./browser").Browser;

if (!Promise.delay)
  Promise.delay = function(ms) {
    return new Promise(res => {
      setTimeout(() => res(), ms);
    });
  };

class BrowserSystem {
  constructor(system) {
    this.system = system;
    this.readyBrowsers = new MessageStream();
  }
  async init() {
    this.browsers = [
      new Browser(await Browser.init())
      // , new Browser(await Browser.init())
      // , new Browser(await Browser.init())
    ];

    const res = this.browsers.map(x =>
      x.navigate("http://deviantart.com").start()
    );
    await Promise.all(res);
    this.readyBrowsers.push(...this.browsers);
  }

  getUsers() {
    const { readyBrowsers } = this;

    return workgen(function*() {
      let browser = yield readyBrowsers.read();

      browser.ready = false;
      yield browser
        .find("#friendslink")
        .then(r => r.click())
        .catch(e => {
          console.log("FRIEND LINK");
        });

      var users = yield wait(async () => {
        console.log("finding users");
        var res = await browser.executeScript(`
          var elms = [].slice.call(document.querySelectorAll('.popup2-friends-menu a.username'));
          return elms
            .map(function(elm) {
              return {
                username:elm.innerHTML,
                url:elm.getAttribute('href'),
                datetime:+new Date()
              }
          });
        `);
        console.log(res.length);
        if (!res.length) return null;
        return res;
      });
      browser.ready = true;
      readyBrowsers.push(browser);
      return users;
    });
  }
  getImagesStream(url, dbimages) {
    const { readyBrowsers } = this;

    return new MessageStream(async function*() {
      const browser = await readyBrowsers.read();
      browser.ready = false;

      let newseenimages;
      let seen = [];
      let ti;

      await browser.navigate(url).ready(3000);

      await initialLoad(browser);

      let scrollproc = workgen(startScrollDown(browser));

      while (true) {
        let allimages = await scrapeImagesOnPage(browser);
        newseenimages = allimages.nimmunique(seen, "id");

        if (newseenimages.length) {
          yield newimages.map(v => v.id);
          ti = +new Date();
        }

        /*if we found existing images or timedout*/
        if (
          allimages.nimmjoin(dbimages, "id").length ||
          +new Date() - ti > 10000
        ) {
          scrollproc.kill();
          yield null;
          break;
        }

        seen = [...seen, ...newseenimages];

        await Promise.delay(1000);
      }
      browser.ready = true;
      readyBrowsers.push(browser);
    });

    async function scrapeImagesOnPage(browser) {
      var res = await browser.executeScript(
        `return [].slice.call( document.querySelectorAll('#gmi- .thumb')).map(function(v){
                                  return {
                                      thumb: v.querySelector('img').src,
                                      reg: v.getAttribute('data-super-img'),
                                      large: v.getAttribute('data-super-full-img'),
                                      id: +v.getAttribute('data-deviationid')
                                  }
                      }).filter(v=>{
                          return v && v.reg && v;
                      })`
      );
      return res;
    }
    function* initialLoad(browser) {
      let ti = +new Date();

      while (+new Date() - ti < 10000) {
        let imagesOnPage = yield scrapeImagesOnPage(browser);
        if (imagesOnPage.length) break;

        yield Promise.delay(1000);
      }
    }
    function* startScrollDown(browser) {
      let scrollTop = yield browser.executeScript(`return window.scrollY`);
      while (true) {
        yield browser.find("body").then(x => x && x.sendKeys(Key.PAGE_DOWN));
        yield Promise.delay(1000);

        let s = yield browser.executeScript(`return window.scrollY`);
        if (s === scrollTop) {
          /*reached bottom*/
          out("raeched bottom");
          return;
        }
        scrollTop = s;
      }
    }
  }

  async login() {
    var browser = this.browsers[0];
    await browser.navigate("https://www.deviantart.com/users/login").ready();

    await wait(
      () =>
        browser.find("#username") != null ||
        browser.find("#login_username") !== null
    );

    var elm = await browser.find("#username, #login_username");
    await elm.sendKeys("jadeitedrake0");

    elm = await browser.find("#password, #login_password");
    await elm.sendKeys("lightsaber");

    await browser
      .navigate(async () => {
        var elm = await browser.find("#loginbutton, [value='Log In']");
        await elm.click();
      })
      .ready();

    var cookies = await browser.driver.manage().getCookies();
    for (let x = 1; x < this.browsers.length; x++) {
      for (let y = 0; y < cookies.length; y++) {
        await this.browsers[x].driver.manage().addCookie(cookies[y]);
      }
    }

    /*switch to old view*/

    elm = await wait(async () => await browser.find("._1vP6a"), 3000);

    if (elm)
      await browser.navigate(async () => {
        var elm = await browser.find("._1vP6a");
        await elm.click();
      });

    await Promise.delay(5000);

    this.browsers.forEach(x => (x.ready = true));

    W.queue();
  }
}

function wait(fn, dur) {
  var ti = +new Date();
  return new Promise(res => {
    (async function work() {
      try {
        var r = fn();
        if (r && r.then)
          r = await r.catch(e => {
            throw e;
          });
      } catch (e) {
        if (+new Date() - ti > dur) {
          res(r);
          return;
        }

        setTimeout(work, 1000);
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

var browserSystem = new Promise(async res => {
  var b = new BrowserSystem();
  await b.init();
  await b.login();
  res(b);
});

module.exports = {
  getUsers: function() {
    return browserSystem.then(b => b.getUsers());
  },
  getImages: function(url, update, seenids, out) {
    return browserSystem.then(b => b.getImages(url, update, seenids, out));
  },
  getImagesStream: function(url, update, seenids) {
    return browserSystem.then(b => b.getImagesStream(url, update, seenids));
  },
  loggedInBrowser: function() {
    return browserSystem.then(v => v.browsers[0]);
  },
  Key
};

// var webdriver = require('selenium-webdriver');
// By=webdriver.By;
// Key=webdriver.Key;
// var chrome = require('selenium-webdriver/chrome');
// var path = require('chromedriver').path;

// let driver = new webdriver.Builder()
// .forBrowser('firefox')
// .setChromeOptions(/* ... */)
// .setFirefoxOptions(/* ... */)
// .build();

// var webdriver = require('selenium-webdriver');
// var chrome = require('selenium-webdriver/chrome');
// var path = require('chromedriver').path;

// var service = new chrome.ServiceBuilder(path).build();
// chrome.setDefaultService(service);

// var driver = new webdriver.Builder()
// .withCapabilities(webdriver.Capabilities.chrome())
// .build();

// var service = new chrome.ServiceBuilder(path).build();

// chrome.setDefaultService(service);
// var options = new chrome.Options();
// //options.setUserPreferences({"profile.default_content_setting_values.images": 2});
// options.addArguments('user-data-dir=C:\\Users\\gene.a\\AppData\\Local\\Google\\Chrome\\User Data\\Default');

// this.driver = new webdriver.Builder()
// .withCapabilities(options)
// .build();

// this.builder=new Promise(res=>res(this.driver));

/////////////////////////////////////

//var firefoxOptions = new firefox.Options();
//firefoxOptions.setProfile('C:/Users/gene.a/AppData/Roaming/Mozilla/Firefox/Profiles/80aw5dgn.default');
