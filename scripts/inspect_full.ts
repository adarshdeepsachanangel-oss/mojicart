async function inspectFull() {
  const url = 'https://www.meesho.com/shiv-shakti-supreme-choker-necklace-set-for-women-and-girl/p/90u6oa';
  const pId = '90u6oa';
  const target = `https://www.meesho.com/s/p/${pId}?__source=mobile`;

  console.log('Fetching:', target);
  const res = await fetch(target, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    redirect: 'follow'
  });

  console.log('Response Status:', res.status, 'Redirected:', res.redirected, 'Final URL:', res.url);
  const html = await res.text();
  console.log('HTML Length:', html.length);

  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) {
    console.log('NO __NEXT_DATA__ in HTML. Snippet:', html.slice(0, 500));
    return;
  }

  const json = JSON.parse(match[1]);
  console.log('Top keys in pageProps:', Object.keys(json.props?.pageProps || {}));
  console.log('Top keys in initialState:', Object.keys(json.props?.pageProps?.initialState || {}));
  const p = json.props?.pageProps?.initialState?.product;
  console.log('Product keys:', p ? Object.keys(p) : 'product is null/undefined');
  if (p?.details) {
    console.log('p.details keys:', Object.keys(p.details));
    console.log('p.details.data:', p.details.data ? { name: p.details.data.name, price: p.details.data.price } : 'data is null');
  }
}
inspectFull();
