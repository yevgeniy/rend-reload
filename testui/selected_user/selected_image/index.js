const {
  describe,
  it,
  before,
  after,
  wait,
  waitFor,
  doWaitFor
} = require("nimm-test-core");

console.log(wait, waitFor, doWaitFor);

module.exports = function(system) {
  let browser;
  describe("selected image", () => {
    before(async () => {
      browser = system.browser;
      await wait(() => browser.find(".loaded").then(v => v.click()));
      await wait(() => browser.find(".framedimage").then(v => v.click()));
    });
    after(async () => {
      await wait(() => browser.find("button", /close/i));
    });

    it("shows image", e => {
      e(() => browser.find("img").then(v => v.hasLoaded()));
    });
    it("mark image", async e => {
      const currentState = await waitFor(async () => {
        if (await browser.find("button.marked")) return "marked";
        else if (await browser.find("button:not(.marked)", /mark/i))
          return "not marked";
        else return null;
      });

      await wait(() => browser.find("button", /mark/i).then(v => v.click()));
      if (currentState == "marked")
        await e(() => browser.find("button:not(.marked)", /mark/i));
      else {
        await e(() => browser.find("button.marked", /mark/i));
      }

      /* put it back*/
      await doWaitFor(
        () => browser.find("button", /mark/i).then(v => v.click()),
        () =>
          currentState === "marked"
            ? browser.find("button.marked", /mark/i)
            : browser.find("button:not(.marked)", /mark/i)
      );
    });
  });
};
