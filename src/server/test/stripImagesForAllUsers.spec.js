const {
  component,
  useState,
  useEffect,
  useCallback,
  root
} = require("nimm-react");
require("../helpers/helpersArray");
const { default: MessageStream } = require("../../MessageStream");

let mockaddfn;
let mockuseImageIds = jest.fn();
let mockOpenStream = jest.fn();
jest.mock("../hooks", () => {
  return {
    useOpenStream: name => mockOpenStream(name),
    useMessageStream: () => ({ add: mockaddfn }),
    useImageIds: username => mockuseImageIds(username)
  };
});

const stripImagesForAllUsers = require("../stripImagesForAllUsers");
const sinon = require("sinon");

var browsersystem = require("../../browser");

describe("stripImagesForAllUsers", () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => sandbox.restore());

  it("don't run dead users", async () => {
    mockaddfn = jest.fn();
    mockuseImageIds = username => {
      if (username === "foo") return [1, 2];
      if (username === "boo") return [33];
    };
    mockOpenStream = streamname => {
      if (streamname === "states")
        return [[+new Date("Oct 2, 2020"), +new Date("Oct 3, 2020")]];
      if (streamname === "users")
        return [
          [
            {
              username: "foo",
              dead: false
            },
            {
              username: "boo",
              dead: true
            }
          ]
        ];
    };

    sandbox.stub(browsersystem, "getWatchStream").returns(
      new MessageStream(function*(out) {
        out([
          [
            {
              /*will not be recorded since its already seen*/
              id: 1,
              username: "foo"
            },
            {
              /*will not record because dead*/
              id: 11,
              username: "boo"
            }
          ],
          "Today"
        ]);

        out([
          [
            {
              id: 4,
              username: "foo"
            }
          ],
          "Oct 2, 2020"
        ]);

        out([
          /*this will trigger the kill*/
          [
            {
              id: 5,
              username: "foo"
            }
          ],
          "Oct 1, 2020"
        ]);

        out([
          /*this will not be recorder since stream was killed*/
          {
            id: 6,
            username: "foo"
          }
        ]);
      })
    );

    root(component(stripImagesForAllUsers, {}));

    await new Promise(res => setTimeout(res, 500));
    expect(mockaddfn.mock.calls).toEqual([
      [{ id: 4, username: "foo", seen: false, datetime: undefined }]
    ]);

    expect(true).toBe(true);
  });

  it("stop streaming if date is reached beyond", async () => {
    mockaddfn = jest.fn();
    mockuseImageIds = username => {
      if (username === "foo") return [1, 2];
      if (username === "boo") return [33];
    };
    mockOpenStream = streamname => {
      if (streamname === "states")
        return [[+new Date("Oct 2, 2020"), +new Date("Oct 3, 2020")]];
      if (streamname === "users") return [[]];
    };

    sandbox.stub(browsersystem, "getWatchStream").returns(
      new MessageStream(function*(out) {
        out([
          [
            {
              /*will not be recorded since its already seen*/
              id: 1,
              username: "foo"
            },
            {
              id: 11,
              username: "boo"
            }
          ],
          "Today"
        ]);

        out([
          [
            {
              id: 4,
              username: "foo"
            }
          ],
          "Oct 2, 2020"
        ]);

        out([
          /*this will trigger the kill*/
          [
            {
              id: 5,
              username: "foo"
            }
          ],
          "Oct 1, 2020"
        ]);

        out([
          /*this will not be recorder since stream was killed*/
          {
            id: 6,
            username: "foo"
          }
        ]);
      })
    );

    root(component(stripImagesForAllUsers, {}));

    await new Promise(res => setTimeout(res, 500));
    expect(mockaddfn.mock.calls).toEqual([
      [{ id: 4, username: "foo", seen: false, datetime: undefined }],
      [{ id: 11, username: "boo", seen: false, datetime: undefined }]
    ]);

    expect(true).toBe(true);
  });

  it("saves new images on stream for each user", async () => {
    mockaddfn = jest.fn();
    mockuseImageIds = username => {
      if (username === "foo") return [1, 2];
      if (username === "boo") return [33];
    };
    mockOpenStream = streamname => {
      if (streamname === "states") return [[]];
      if (streamname === "users") return [[]];
    };

    sandbox.stub(browsersystem, "getWatchStream").returns(
      new MessageStream(function*(out) {
        out([
          [
            {
              id: 1,
              username: "foo",
              imgdate: "Today"
            },
            {
              id: 11,
              username: "boo",
              imgdate: "Today"
            }
          ]
        ]);

        out([
          [
            {
              id: 2,
              username: "foo",
              imgdate: "Yesturday"
            },
            {
              id: 22,
              username: "boo",
              imgdate: "Today"
            }
          ]
        ]);

        out([
          [
            {
              id: 3,
              username: "foo",
              imgdate: "Yesturday"
            },
            {
              id: 33,
              username: "boo",
              imgdate: "Today"
            }
          ]
        ]);

        out([
          [
            {
              id: 4,
              username: "foo",
              imgdate: "Yesturday"
            }
          ]
        ]);
      })
    );

    root(component(stripImagesForAllUsers, {}));

    await new Promise(res => setTimeout(res, 300));
    expect(mockaddfn.mock.calls).toEqual([
      [
        {
          id: 3,
          username: "foo",
          imgdate: "Yesturday",
          datetime: undefined,
          seen: false
        },
        {
          id: 4,
          username: "foo",
          imgdate: "Yesturday",
          datetime: undefined,
          seen: false
        }
      ],
      [
        {
          id: 11,
          username: "boo",
          imgdate: "Today",
          datetime: undefined,
          seen: false
        },
        {
          id: 22,
          username: "boo",
          imgdate: "Today",
          datetime: undefined,
          seen: false
        }
      ]
    ]);
    expect(true).toBe(true);
  });

  it("saves new images on streams", async () => {
    mockaddfn = jest.fn();
    mockuseImageIds = () => [1, 2];
    mockOpenStream = streamname => {
      if (streamname === "states") return [[]];
      if (streamname === "users") return [[]];
    };
    sandbox.stub(browsersystem, "getWatchStream").returns(
      new MessageStream(function*(out) {
        out([
          [
            {
              id: 1,
              username: "foo",
              imgdate: "Today"
            }
          ]
        ]);

        out([
          [
            {
              id: 2,
              username: "foo",
              imgdate: "Yesturday"
            }
          ]
        ]);

        out([
          [
            {
              id: 3,
              username: "foo",
              imgdate: "Yesturday"
            }
          ]
        ]);

        out([
          [
            {
              id: 4,
              username: "foo",
              imgdate: "Yesturday"
            }
          ]
        ]);
      })
    );

    root(component(stripImagesForAllUsers, {}));

    await new Promise(res => setTimeout(res, 300));
    expect(mockaddfn.mock.calls).toEqual([
      [
        {
          id: 3,
          username: "foo",
          imgdate: "Yesturday",
          datetime: undefined,
          seen: false
        },
        {
          id: 4,
          username: "foo",
          imgdate: "Yesturday",
          datetime: undefined,
          seen: false
        }
      ]
    ]);
    expect(true).toBe(true);
  });

  it("saves images", async () => {
    mockaddfn = jest.fn();
    mockuseImageIds = () => [];
    mockOpenStream = streamname => {
      if (streamname === "states") return [[]];
      if (streamname === "users") return [[]];
    };
    sandbox.stub(browsersystem, "getWatchStream").returns(
      new MessageStream(function*(out) {
        out([
          [
            {
              id: 1,
              username: "foo",
              imgdate: "Today"
            },
            {
              id: 2,
              username: "foo",
              imgdate: "Yesturday"
            }
          ]
        ]);
      })
    );

    const instanceTime = +new Date();

    root(component(stripImagesForAllUsers, { instanceTime }));

    await new Promise(res => setTimeout(res, 300));
    expect(mockaddfn.mock.calls).toEqual([
      [
        {
          id: 1,
          username: "foo",
          imgdate: "Today",
          datetime: instanceTime,
          seen: false
        },
        {
          id: 2,
          username: "foo",
          imgdate: "Yesturday",
          datetime: instanceTime,
          seen: false
        }
      ]
    ]);
    expect(true).toBe(true);
  });

  it("saves only new images", async () => {
    mockaddfn = jest.fn();
    mockuseImageIds = () => [1, 2];
    mockOpenStream = streamname => {
      if (streamname === "states") return [[]];
      if (streamname === "users") return [[]];
    };
    sandbox.stub(browsersystem, "getWatchStream").returns(
      new MessageStream(function*(out) {
        out([
          [
            {
              id: 1,
              username: "foo",
              imgdate: "Today"
            },
            {
              id: 2,
              username: "foo",
              imgdate: "Yesturday"
            },
            {
              id: 3,
              username: "foo",
              imgdate: "Yesturday"
            }
          ]
        ]);
      })
    );

    root(component(stripImagesForAllUsers, {}));

    await new Promise(res => setTimeout(res, 300));
    expect(mockaddfn.mock.calls).toEqual([
      [
        {
          id: 3,
          username: "foo",
          imgdate: "Yesturday",
          datetime: undefined,
          seen: false
        }
      ]
    ]);
    expect(true).toBe(true);
  });
});
