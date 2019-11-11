const [workgen, browser, Key, out]=args;

  
Promise.delay=ns=> {
    return new Promise(res=>setTimeout(res,ns))
}

async function scrapeImagesOnPage() {
    var res = await browser.executeScript(
      `return [].slice.call( document.querySelectorAll('#gmi- .thumb')).map(function(v){
                                return {
                                    thumb: v.querySelector('img').src,
                                    reg: v.getAttribute('data-super-img'),
                                    large: v.getAttribute('data-super-full-img'),
                                    id: +v.getAttribute('data-deviationid')
                                }
                    }).filter(v=>{
                        return v && v.reg && v;
                    })`
    );
    return res;
  }
function* scrapeForNewImages(previousScrape) {
    let ti = +new Date();

    while (+new Date() - ti < 10000) {
      let imagesOnPage = yield scrapeImagesOnPage();
      if (!imagesOnPage.length) {
        /*not yet loaded first batch of images*/
        yield Promise.delay(500);
        continue;
      }

      if (!previousScrape) {
        /*first time loading the batch of images*/
        return imagesOnPage;
      }

      if (imagesOnPage.nimmunique(previousScrape, "id").length) {
        /*got a new batch of images*/
        return imagesOnPage;
      }
      yield Promise.delay(500);
    }

    return previousScrape || [];
}

function* initialLoad() {
    let ti = +new Date();

    while (+new Date() - ti < 10000) {
      let imagesOnPage = yield scrapeImagesOnPage();
      if (imagesOnPage.length)
        break;
    
      yield Promise.delay(1000);
    }
}
function* startScrollDown() {
    
    let scrollTop = yield browser.executeScript(`return window.scrollY`);
    while(true) {
        
        yield browser.find("body").then(x => x && x.sendKeys(Key.PAGE_DOWN));
        yield Promise.delay(1000);

        let s=yield browser.executeScript(`return window.scrollY`);
        if (s===scrollTop) {
            /*reached bottom*/
            out('raeched bottom');
            return;  
        }
        scrollTop=s;
    }  
}

let newimages;
const url='https://www.deviantart.com/twistedscarlett60/gallery/';

yield browser.navigate(url).ready(3000); 
let dbimages=[];
let seen=[];

yield initialLoad();

workgen(startScrollDown());

let ti;
while(true) {
    let allimages=yield scrapeImagesOnPage();
    let newimages=allimages.nimmunique(seen,'id');
  
    if (newimages.length) {
        //out(newimages.map(v=>v.id)); 
        ti= +new Date(); 
    }  

    /*if we found existing images or timedout*/
    if (allimages.nimmjoin(dbimages,'id').length || +new Date()-ti >10000) {
        t.kill();
        out(null);
        break;
    }

    seen=[...seen, ...newimages];
  
    yield Promise.delay(1000);
}
         