async function testAlternativeDomains() {
  const pId = '90u6oa';
  const endpoints = [
    `https://api.meesho.com/products/${pId}`,
    `https://api.meesho.com/v1/products/${pId}`,
    `https://query.meesho.com/v1/product/${pId}`,
    `https://supply.meesho.com/api/v1/products/${pId}`,
    `https://search.meesho.com/product/${pId}`,
    `https://web.archive.org/web/2026/https://www.meesho.com/s/p/${pId}`,
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { signal: AbortSignal.timeout(4000) });
      console.log(ep, '->', res.status);
    } catch (e: any) {
      console.log(ep, '-> ERR:', e.message);
    }
  }
}
testAlternativeDomains();
