var PATH = require('path');
var FS=require('fs');

const {Builder, By, Key, until} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');



	//RUNNING FROM EXTERNAL CONTAINER*

	//https://www.softwaretestinghelp.com/docker-selenium-tutorial/

	let driver = new webdriver.Builder()
		.forBrowser('firefox')
		.usingServer('http://driver:4444/wd/hub')
		.build();

	driver.get('https://www.google.com/search?rlz=1C1CHBF_enUS821US821&biw=1178&bih=690&tbm=isch&sa=1&ei=MH4NXOqpEu21tgWCsaeYAQ&q=elegant+and+naked&oq=elegant+and+naked&gs_l=img.3...7363.8488..8595...0.0..0.70.467.9......1....1..gws-wiz-img.......0j0i8i30j0i24.8N6lff5rxmM').then(v=>{
		driver.takeScreenshot().then((image,err)=>{
					
			FS.writeFileSync('out.png', Buffer.from(image,'base64'));
			console.log('done');
		});
	});





(function loop() {
	setTimeout(loop,3000);
})()