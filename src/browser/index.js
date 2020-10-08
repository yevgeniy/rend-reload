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
    const c = this.readyBrowsers.onRead(async () => {
      c();
      await this.init();
      await this.login();
    });

    this.Key = Key;
  }

  async init() {
    this.browsers = [
      new Browser(await Browser.init()),
      new Browser(await Browser.init())
      // , new Browser(await Browser.init())
    ];

    const res = this.browsers.map(x =>
      x.navigate("http://deviantart.com").start()
    );
    await Promise.all(res);
  }

  async stripUsers() {
    const browser = await this.readyBrowsers.read();
    browser.ready = false;

    await browser
      .navigate("https://www.deviantart.com/jadeitedrake0/about#watching")
      .ready();

    /*open all of the users*/
    let res;
    do {
      res = await browser.executeScript(`
      var [button] = [...document.querySelectorAll('#watching button')].filter(v=>v.innerHTML==='Load more');
      if (button) {
        button.click();
        return true;
      }

      return false;
    `);
      await Promise.delay(500);
    } while (res);

    /*get all users*/
    res = await browser.executeScript(`
      var res=[...document.querySelectorAll('#watching a.user-link')].map(v=>{
        return {
          username: v.querySelector('.F1KyP').innerHTML,
          url: v.href,
          datetime:+new Date(),
          isEmpty:true,
        }
      });
      return res;
    `);

    browser.ready = true;
    return res;
  }

  async getRegImageSrc(url) {
    const browser = await this.readyBrowsers.read();
    browser.ready = false;

    await browser.navigate(url).ready(3000);

    const res = await wait(async function() {
      const r = await browser.executeScript(`
        return document.querySelector('._1izoQ.vbgSM')
          ? document.querySelector('._1izoQ.vbgSM').src 
          : null
        `);
      return r;
    });

    browser.ready = true;
    this.readyBrowsers.push(browser);
    return res;
  }

  getImagesStream(url, existing, reachedBottom) {
    const { readyBrowsers } = this;

    return new MessageStream(async function(out) {
      let r = readyBrowsers.read();
      const browser = await r;
      browser.ready = false;

      let newseenimages;
      let seen = [];
      let ti = +new Date();

      await browser.navigate(url).ready(3000);

      await initialLoad(browser);

      let scrollproc = workgen(startScrollDown(browser));

      while (true) {
        let allimages = await scrapeImagesOnPage(browser);
        newseenimages = allimages.nimmunique(seen, "id");

        if (newseenimages.length) {
          out(newseenimages);
          ti = +new Date();
        }
        seen = [...allimages];

        /*if we found existing images or timedout*/
        if (
          allimages.map(v => v.id).nimmjoin(existing).length ||
          +new Date() - ti > 10000
        ) {
          scrollproc.kill();
          out(null);
          break;
        }

        await Promise.delay(1000);
      }
      browser.ready = true;
      readyBrowsers.push(browser);
    });

    async function scrapeImagesOnPage(browser) {
      var res = await browser.executeScript(
        `return [].slice.call( document.querySelectorAll('._2S8RD.Y-DVc')).map(function(v){
                                  return {
                                      thumb: v.querySelector('img').src,
                                      href: v.querySelector('a').href,
                                      //reg: v.getAttribute('data-super-img'),
                                      //large: v.getAttribute('data-super-full-img'),
                                      id: +v.querySelector('a').href.split('-').slice(-1)[0]
                                  }
                      }).filter(v=>{
                          return v && v.thumb && v;
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

    this.readyBrowsers.pushUnique(...this.browsers);
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

module.exports = new BrowserSystem();

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
