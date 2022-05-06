const functions = require("firebase-functions");
const puppeteer = require('puppeteer');

// admin seems to be necessary in order
// to run the function via `firebase emulators`
const admin = require("firebase-admin");
admin.initializeApp();

// should increase performance a little
const minimal_args = [
  '--Disable-dev-shm-usage',//Create temporary file shared memory
  '--Disable-setuid-sandbox',//uid sandbox
  '–-No-first-run',//No home page is set. At startup, a blank page will open.
  '--No-sandbox',//sandbox mode
  '–-No-zygote',
];

exports.preview = functions
  .runWith({ memory: "512MB", timeoutSeconds: 10 })
  .https.onRequest(async (req, res) => {
	const browser = await puppeteer.launch({
	  defaultViewport: { width: 400, height: 300 },
	  args: minimal_args,
	  headless: true
	});

	const {
	  query: { q = "" },
	} = req;
	
	const page = await browser.newPage();

	await page.setContent(q);
	const screenshot = await page.screenshot();
	await browser.close();

	res.header({ "Content-Type": "image/png" });
	res.end(screenshot, "binary");
  });
