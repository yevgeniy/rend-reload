const { describe, it, before, after } = require("nimm-test-core");
const { spawn } = require("child_process");
const { Builder, By, Key, until } = require("selenium-webdriver");
const Browser = require("./Browser");

describe("rend site", () => {
  let ls;
  let browser;
  const system = {};

  before(async () => {
    /*start site*/
    // ls && ls.kill();
    // await new Promise(res => setTimeout(res, 2000));

    // ls = spawn("yarn", ["start", "--nobrowser"]);

    // await new Promise(res => setTimeout(res, 500));

    browser && (await browser.quit());
    browser = new Browser(await new Builder().forBrowser("firefox").build());
    await browser.get("http://localhost:3000/");

    system.browser = browser;
  });
  after(async () => {
    console.log("killing");
    browser && (await browser.quit());

    //    console.log(ls.pid);
    //    spawn("kill", ["-9", ls.pid + 2]);
  });

  it("show users", e => {
    e(async () => (await browser.findAll(".user")).length > 0);
  });
  it("show state", async e => {
    e(async () => (await browser.findAll(".state")).length > 0);
  });
  it("show dead users", e => {
    e(async () => (await browser.findAll(".dead-user")).length > 0);
  });
  it("cartoonpink exists", e => {
    e(async () => {
      return browser
        .findAll(".user")
        .then(users => users.findAsync(v => v.contains(/cartoonpink/i)));
    });
  });
  it("selecting user goes to user page", async e => {
    await e(async () => (await browser.findAll(".user")).length > 0);

    const elm = await browser
      .findAll(".user")
      .then(users => users.findAsync(v => v.contains(/4970052/i)));
    await elm.click();

    /*wait for some img to load*/
    await e(async () => (await browser.findAll(".loaded")).length > 0);

    await browser.back();
  });

  require("./selected_user")(system);
});
