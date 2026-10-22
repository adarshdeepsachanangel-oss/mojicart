async function probe() {
  try {
    const res = await fetch("https://www.meesho.com", {
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML len:", html.length);
    const match = html.match(/"buildId":"([^"]+)"/);
    console.log("Build ID:", match ? match[1] : "None");
    if (!match) {
      console.log("Snippet:", html.substring(0, 300));
    }
  } catch (err) {
    console.error(err);
  }
}

probe();
