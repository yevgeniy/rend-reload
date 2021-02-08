const { wait, waitFor, doWait, doWaitFor, expect } = require("nimm-test-core");

module.exports = function(driver) {
  return {
    node: function() {
      return driver.find(".framedimage");
    },
    isMarked: async function() {
      const currentState = await waitFor(async () => {
        const elm = await this.node();
        if (await elm.find("button.marked")) return "marked";
        else if (await elm.find("button:not(.marked)", /mark/i))
          return "not marked";
        else return null;
      });
      return currentState === "marked";
    },
    toggleMarked: async function() {
      const isMarked = await this.isMarked();

      await doWait(
        () =>
          this.node()
            .then(v => v.find("button", /mark/i))
            .then(v => {
              return v.click();
            }),
        () => this.isMarked().then(v => v === !isMarked)
      );
    }
  };
};
