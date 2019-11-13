describe("foo", () => {
  it("foo this", () => {
    new Promise(res => res())
      .then(() => init())
      .then(() => login())
      .then(() => readUsers())
      .then(async users => {
        let entry;
        while ((entry = users.shift())) {
          await parseUser(entry);
        }
      });
  });
});

function gotoPage(url) {
  return new Promise(Res => {
    function work() {
      cy.visit(url, { failOnStatusCode: false }).then(() => {
        if (
          Cypress.$("body")
            .html()
            .match(`You don't have permission to access this page`)
        ) {
          cy.go("back");
          cy.wait(2000).then(() => work());
        } else Res();
      });
    }
    work();
  });
}
function writeImages(path, data) {
  return new Promise(Res => {
    cy.writeFile(path, data).then(() => Res());
  });
}

let guid = 0;
async function parseUser(entry) {
  let { url, existing, username } = entry;
  let seen = [];
  let ti;

  await gotoPage(url);

  let loaded = await initialLoad();
  if (!loaded) return;

  while (true) {
    await pageDown();
    let allimages = await scrapeImagesOnPage();
    let newimages = allimages.filter(v => !seen.some(vv => vv.id == v.id));
    if (newimages.length) {
      allimages.forEach(v => (v.username = username));
      ti = +new Date();
      await writeImages(`src/out/${++guid}.json`, newimages);
    }
    seen = [...allimages];

    if (
      +new Date() - ti > 10000 ||
      allimages.some(v => existing.some(id => id == v.id))
    ) {
      break;
    }

    await new Promise(res => cy.wait(500).then(() => res()));
  }
}
function pageDown() {
  return new Promise(Res => {
    cy.window()
      .invoke("scrollBy", 0, 1000)
      .then(() => Res());
  });
}
function scrapeImagesOnPage() {
  return new Promise(Res => {
    let res = [];

    cy.get("body").then($body => {
      let l = Cypress.$("#gmi- .thumb").length;
      if (l === 0) {
        Res([]);
      } else {
        cy.get("#gmi- .thumb")
          .each(function($v) {
            res.push({
              thumb: $v.find("img").attr("src"),
              reg: $v.attr("data-super-img"),
              large: $v.attr("data-super-full-img"),
              id: +$v.attr("data-deviationid")
            });
          })
          .then(() => {
            res = res.filter(v => v && v.reg && v);
            cy.log(JSON.stringify(res));
            Res(res);
          });
      }
    });
  });
}
async function initialLoad() {
  let ti = +new Date();

  while (+new Date() - ti < 10000) {
    let imagesOnPage = await scrapeImagesOnPage();
    if (imagesOnPage.length) return true;

    await new Promise(res => cy.wait(500).then(() => res()));
  }
  return false;
}
function readUsers() {
  return new Promise(res => {
    cy.readFile("src/users.json").then(users => res(users));
  });
}

function init() {
  return new Promise(res => {
    cy.visit("http://deviantart.com").then(v => {
      cy.log("hello there");
      res();
    });
  });
}
function login() {
  return new Promise(res => {
    cy.contains("Sign In").click();

    cy.get("#username").type("jadeitedrake0");
    cy.get("#password").type("lightsaber");
    cy.get("#loginbutton").click();
    res();
  });
}

// yarn add --dev @cypress/webpack-preprocessor ts-loader

// const wp = require('@cypress/webpack-preprocessor')

// module.exports = (on) => {
//   const options = {
//     webpackOptions: {
//       resolve: {
//         extensions: [".ts", ".tsx", ".js"]
//       },
//       module: {
//         rules: [
//           {
//             test: /\.tsx?$/,
//             loader: "ts-loader",
//             options: { transpileOnly: true }
//           }
//         ]
//       }
//     },
//   }
//   on('file:preprocessor', wp(options))
// }
