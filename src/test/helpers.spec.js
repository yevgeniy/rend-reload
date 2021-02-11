const { workgen } = require("../helpers");

describe("helpers", () => {
  it("works with normal generator", async () => {
    const fn = jest.fn();

    let a = 0;
    await workgen(function*() {
      fn("a");

      const a = yield Promise.resolve("b");

      fn(a);
    });

    expect(fn.mock.calls).toEqual([["a"], ["b"]]);
  });
  it("works with async functions", async () => {
    const fn = jest.fn();

    let a = 0;
    await workgen(async function*() {
      fn("a");

      const a = yield Promise.resolve("b");

      fn(a);
    });

    expect(fn.mock.calls).toEqual([["a"], ["b"]]);
  });
});
