import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

( async () => {

    puppeteer.use(StealthPlugin());

    const chromeExecPath = `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`;

    const browser = await puppeteer.launch({executablePath: chromeExecPath, headless: false}); // headless: "new"
        
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html');
    await page.goto('https://www.youtube.com');

    await page.waitForSelector("input#search", {visible: true, timeout:5000});

    await page.focus("input#search");
    await page.type("input#search", "haul france");

    await page.evaluate(() => {
        const form: HTMLFormElement | null = document.querySelector('form#search-form');
        if (form) form.submit();
    });

    await new Promise(resolve => setTimeout(resolve, 8000));

    const elements = await page.$$('.yt-simple-endpoint.style-scope.yt-formatted-string');
    let hrefs: string[] = [];
    
    for (let element of elements) {
        const href = await page.evaluate(el => el.getAttribute('href'), element);
        hrefs=[...hrefs, `https://www.youtube.com${href}/about`]
    }


    for ( let href in hrefs ) {
        // document.querySelector('yt-formatted-string#description').innerHTML
        // document.getElementsByClassName('yt-core-attributed-string__link') => after index 2 it's link commercial
    }

})()