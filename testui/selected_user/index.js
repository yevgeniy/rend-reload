const { expect, wait, waitFor, doWaitFor } = require("nimm-test-core");

module.exports = function(system) {
  let browser;
  describe("selected_user", () => {
    before(async () => {
      browser = system.browser;

      const elm = await waitFor(() =>
        browser
          .findAll(".user")
          .then(users => users.findAsync(v => v.contains(/LollipopJelly/i)))
      );
      await doWaitFor(
        () => elm.click(),
        () => browser.findAll(".loaded").then(x => x.length > 0)
      );
    });
    after(async () => {
      await browser.back();
    });
    it("shows user name", async () => {
      expect(() =>
        browser
          .find(".username")
          .then(v => v.text())
          .then(v => v === "LollipopJelly")
      );
    });
    it("clicking on image selects images", async () => {
      await browser.findAll(".loaded").then(v => v[0].click());
      await expect(() => browser.find(".framedimage"));

      /*close*/
      await wait(() => browser.find("button", /close/i).then(v => v.click()));
    });

    require("./selected_image")(system);
  });
};
