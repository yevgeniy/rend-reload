const { attempt, wait, waitFor, doWaitFor, expect } = require("nimm-test-core");

module.exports = function(system) {
  let browser;
  describe("selected image", () => {
    before(async () => {
      browser = system.browser;
      await attempt(() => browser.find(".loaded").then(v => v.click()));
    });
    after(async () => {
      await attempt(() =>
        browser.find("button", /close/i).then(v => v.click())
      );
    });

    it("shows image", () => {
      expect(() => browser.find("img").then(v => v.hasLoaded()));
    });
    it("mark image", async () => {
      const frameImg = system.pages.FrameImg(browser);

      const isInitiallyMarked = await frameImg.isMarked();

      await frameImg.toggleMarked();

      await expect(() =>
        frameImg.isMarked().then(v => v !== isInitiallyMarked)
      );

      /*put it back*/
      await frameImg.toggleMarked();
    });
  });
};
