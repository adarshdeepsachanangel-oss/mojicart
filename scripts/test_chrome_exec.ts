import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function testChrome() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const url = 'https://www.meesho.com/shiv-shakti-supreme-choker-necklace-set-for-women-and-girl/p/90u6oa';

  console.log('Running Chrome...');
  try {
    const { stdout, stderr } = await execFileAsync(chromePath, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--dump-dom',
      url
    ], {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 15000
    });

    console.log('Stdout length:', stdout.length);
    console.log('Stderr:', stderr.slice(0, 200));

    const match = stdout.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (match) {
      const data = JSON.parse(match[1]);
      const p = data.props?.pageProps?.initialState?.product?.details?.data;
      console.log('CHROME SUCCEEDED!');
      console.log('Product Name:', p?.name);
      console.log('Product Price: ₹' + p?.price);
      console.log('Images Count:', p?.images?.length);
    } else {
      console.log('No __NEXT_DATA__ in Chrome output. First 300 chars:');
      console.log(stdout.slice(0, 300));
    }
  } catch (err: any) {
    console.error('Chrome execution failed:', err.message);
  }
}
testChrome();
