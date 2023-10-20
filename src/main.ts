import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const DELAY_PROFIL_PAGE_VISIT_MS:number = 5000;

const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
    hrefs = [...new Set(hrefs)];

    




    for (let href of hrefs) {
        console.log(href);
        const aboutPageResponse = await page.goto(href);

        await delay(DELAY_PROFIL_PAGE_VISIT_MS);

        if ( aboutPageResponse && aboutPageResponse.status() === 200 ) { 

            
            // TODO implements count sub
            // const subs = '1 M abonnés';

            // let factor = {
            // "k": 10e2,
            // "m": 10e5,
            // "b": 10e9
            // };

            // console.log(761*10e5)

            // let x = subs.split(" ");
            // let totalSub = parseFloat(x[0].replace(',','.')) * factor[x[1].toLowerCase()]
            // console.log(totalSub)

            
            // get links from about page > links
            try {
                console.log("> FROM LINKS BLOCK")

                await page.waitForSelector('div#links-container', {visible: true, timeout:5000});

                const links = await page.evaluate(() => 
                        Array.from(document.querySelectorAll('.yt-channel-external-link-view-model-wiz')).map((link:any) => link.innerText)
                    );

                if ( links ) {
                    const extractedLinks = links.map(link => link.split('\n')[1]);
                    console.log(extractedLinks);
                }


            } catch ( e ) {
                console.log(e);
            }

            console.log("--------------------------|         |-----------------------------")

            try {
                await page.waitForSelector('yt-formatted-string#description', {visible: true, timeout:5000});
                
                // get emails from about page > description ( email )
                const description = await page.evaluate(() => (document.querySelector('yt-formatted-string#description') as any)?.text.simpleText);

                console.log("> FROM DESCRIPTINO : ")
                if ( description ) {

                    console.log(description)
    
                    const emails = description.match(emailRegex);

                    if ( emails ) {
                        console.log(emails)
                    }

                } else {
                    console.log("> No description found")
                }

            } catch ( e ) {
                console.log(e);
            }

        }

        console.log("===============================================")
    }


    // document.querySelectorAll('.yt-channel-external-link-view-model-wiz')

})()