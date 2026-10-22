import { execSync } from "child_process";

const url = "https://www.meesho.com/s/p/7gigh9";
console.log("Fetching with default curl.exe:", url);

try {
  const html = execSync(`curl.exe -s -L "${url}"`, {
    maxBuffer: 10 * 1024 * 1024,
  }).toString("utf8");

  console.log("HTML length:", html.length);
  console.log("Has __NEXT_DATA__:", html.includes("__NEXT_DATA__"));

  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (match) {
    const json = JSON.parse(match[1]);
    const p = json?.props?.pageProps?.initialState?.product?.details?.data;
    console.log("SUCCESS! Parsed via curl:");
    console.log("Name:", p?.name);
    console.log("Price:", p?.price);
    console.log("MRP:", p?.original_price);
    console.log("Images:", p?.images?.length);
  } else {
    console.log("Snippet:", html.substring(0, 300));
  }
} catch (err) {
  console.error("Error:", err.message);
}
