import { addExtra } from "puppeteer-extra";
import puppeteerCore from "puppeteer-core";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const puppeteer = addExtra(puppeteerCore);
puppeteer.use(StealthPlugin());

async function test(url) {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1920,1080",
    ],
  });

  const page = await browser.newPage();
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    const info = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector("h1")?.innerText,
        hasNextData: Boolean(window.__NEXT_DATA__),
        pName: window.__NEXT_DATA__?.props?.pageProps?.initialState?.product?.details?.data?.name,
        sensor: Boolean(document.getElementById("sec-if-cpt-container")),
      };
    });
    console.log(url, "->", info);
  } catch (e) {
    console.error(url, "ERR:", e.message);
  } finally {
    await browser.close();
  }
}

async function run() {
  await test("https://www.meesho.com/a-trending-womens-lavender-embroidered-cotton-kurta-set-with-dupatta-pastel-purple-straight-fit-kurti-pant-set-with-heavy-embroidered-dupatta-elegant-mauve-chikankari-style-cotton-salwar-suit-set-for-women-pack-of-3/p/7shysg");
  await test("https://www.meesho.com/exclusive-brown-rayon-embroidered-kurta-with-bell-sleeves-pant/p/81zi05");
  await test("https://www.meesho.com/ashirwad-kurta-set-for-womenprinted-kurta-set-for-womenstylish-kurta-sets-for-womenfloral-kurta-setcotton-kurta-set-for-women-bit/p/90tis4");
}

run();
