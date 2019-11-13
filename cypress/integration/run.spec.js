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

let guid = 0;
async function parseUser(entry) {
  let { url, existing } = entry;
  let seen = [];
  let ti;
  cy.visit(url);

  await initialLoad();
  while (true) {
    await pageDown();
    let allimages = await scrapeImagesOnPage();
    let newimages = allimages.filter(v => !seen.some(vv => vv.id == v.id));
    if (newimages.length) {
      ti = +new Date();
      cy.writeFile(`src/browser/out/${++guid}.json`, newimages);
      cy.task("newimages", newimages);
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
  });
}
async function initialLoad() {
  let ti = +new Date();

  while (+new Date() - ti < 10000) {
    let imagesOnPage = await scrapeImagesOnPage();
    if (imagesOnPage.length) break;

    await wait(500);
  }
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
function wait(ms) {
  return new Promise(res => {
    let ti = +new Date();
    while (+new Date() - ti < ms) {}
    res();
  });
}
