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

  console.log("Navigating...");
  await page.goto("https://www.meesho.com/gold-plated-fancy-jhumka-earrings-for-women-set-of-6-traditional-oxidised-gold-jhumka-earrings-combo-for-women-daily-wear-ethnic-jhumka-earrings-set-for-women-pack-of-6/p/7gigh9", {
    waitUntil: "domcontentloaded",
  });

  // Human simulation
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(100 + i * 80, 200 + i * 40);
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log("Waiting for product title or __NEXT_DATA__...");
  try {
    await page.waitForFunction(
      () => {
        const title = document.title;
        return (
          Boolean(window.__NEXT_DATA__) ||
          (title && !title.includes("Access Denied") && title.length > 5) ||
          Boolean(document.querySelector("h1"))
        );
      },
      { timeout: 20000 }
    );
    console.log("FOUND!");
    console.log("Title:", await page.title());
    const data = await page.evaluate(() => {
      const state = window.__NEXT_DATA__?.props?.pageProps?.initialState?.product?.details?.data;
      if (state) {
        return {
          fromNext: true,
          name: state.name,
          price: state.price,
          mrp: state.original_price,
          images: state.images?.length,
        };
      }
      return {
        fromDOM: true,
        h1: document.querySelector("h1")?.innerText,
        h4: document.querySelector("h4")?.innerText,
      };
    });
    console.log("Extracted:", data);
  } catch (e) {
    console.log("Wait failed:", e.message);
    console.log("Final title:", await page.title());
    console.log("Content len:", (await page.content()).length);
  }

  await browser.close();
}

run();
