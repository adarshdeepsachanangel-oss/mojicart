import { addExtra } from "puppeteer-extra";
import puppeteerCore from "puppeteer-core";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const puppeteer = addExtra(puppeteerCore);
puppeteer.use(StealthPlugin());

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function test() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1920,1080",
      "--lang=en-US,en",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const url = "https://www.meesho.com/gold-plated-fancy-jhumka-earrings-for-women-set-of-6-traditional-oxidised-gold-jhumka-earrings-combo-for-women-daily-wear-ethnic-jhumka-earrings-set-for-women-pack-of-6/p/7gigh9";
    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const title = await page.title();
    console.log("Page title:", title);

    const hasNext = await page.evaluate(() => Boolean(window.__NEXT_DATA__));
    console.log("Has __NEXT_DATA__:", hasNext);

    if (hasNext) {
      const data = await page.evaluate(() => {
        const d = window.__NEXT_DATA__?.props?.pageProps?.initialState?.product?.details?.data;
        return {
          name: d?.name,
          price: d?.price,
          mrp: d?.original_price,
          images: d?.images?.length,
        };
      });
      console.log("SUCCESS! Extracted:", data);
    } else {
      console.log("Body snippet:", (await page.content()).substring(0, 400));
    }
  } finally {
    await browser.close();
  }
}

test().catch(console.error);
