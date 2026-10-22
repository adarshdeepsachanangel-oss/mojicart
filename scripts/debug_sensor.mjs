import { addExtra } from "puppeteer-extra";
import puppeteerCore from "puppeteer-core";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const puppeteer = addExtra(puppeteerCore);
puppeteer.use(StealthPlugin());

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1280,800",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  page.on("requestfailed", (req) =>
    console.log("REQ FAILED:", req.url(), req.failure()?.errorText)
  );

  console.log("Navigating...");
  await page.goto("https://www.meesho.com/gold-plated-fancy-jhumka-earrings-for-women-set-of-6-traditional-oxidised-gold-jhumka-earrings-combo-for-women-daily-wear-ethnic-jhumka-earrings-set-for-women-pack-of-6/p/7gigh9", {
    waitUntil: "domcontentloaded",
  });

  // Let's simulate human mouse movements
  console.log("Moving mouse...");
  for (let i = 0; i < 5; i++) {
    await page.mouse.move(100 + i * 50, 200 + i * 30);
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("Title after 5s:", await page.title());
  const hasNext = await page.evaluate(() => Boolean(window.__NEXT_DATA__));
  console.log("Has __NEXT_DATA__:", hasNext);

  await new Promise((r) => setTimeout(r, 5000));
  console.log("Title after 10s:", await page.title());
  console.log("Has __NEXT_DATA__ after 10s:", await page.evaluate(() => Boolean(window.__NEXT_DATA__)));

  await browser.close();
}

run();
