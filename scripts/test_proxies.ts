async function testProxies() {
  const meeshoUrl = 'https://www.meesho.com/shiv-shakti-supreme-choker-necklace-set-for-women-and-girl/p/90u6oa';
  const encoded = encodeURIComponent(meeshoUrl);

  const proxies = [
    `https://corsproxy.io/?${encoded}`,
    `https://api.allorigins.win/raw?url=${encoded}`,
    `https://api.codetabs.com/v1/proxy?quest=${encoded}`,
    `https://thingproxy.freeboard.io/fetch/${meeshoUrl}`,
  ];

  for (const p of proxies) {
    try {
      console.log('Testing proxy:', p.slice(0, 50));
      const res = await fetch(p, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(8000),
      });
      console.log('-> Status:', res.status);
      if (res.ok) {
        const text = await res.text();
        console.log('-> Length:', text.length, 'has __NEXT_DATA__:', text.includes('__NEXT_DATA__'));
        if (text.includes('__NEXT_DATA__')) {
          const match = text.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
          if (match) {
            const data = JSON.parse(match[1]);
            const prod = data.props?.pageProps?.initialState?.product?.details?.data;
            console.log('-> EXTRACTED TITLE:', prod?.name);
            console.log('-> EXTRACTED PRICE:', prod?.price);
            console.log('-> EXTRACTED IMAGES:', prod?.images?.length);
          }
        }
      }
    } catch (e: any) {
      console.log('-> Error:', e.message);
    }
  }
}
testProxies();
