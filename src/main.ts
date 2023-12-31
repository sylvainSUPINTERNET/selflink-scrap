import 'dotenv/config'

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Workbook, Worksheet } from 'exceljs';
import path from "path";
import fs from 'fs';
import { sendEmail } from './emailing/smtpClientOvh';

interface IReport {
    emails: string[],
    subscribers: number,
    ytb_id: string,
    links: string[]
}

let MAX_PROSPECTS_PER_SEARCH:number = 40;

const DELAY_PROFIL_PAGE_VISIT_MS:number = 5000;

const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const qualityProspect = (reports: IReport[]) => {
    console.log("cleaning reports")
    const quality = reports.filter(report => report.subscribers >= 1000 && report.subscribers <= 100000);
    return quality;
}

const writeReport = async ( qualifiedReport: IReport[], search:string ) => {
    console.log("WRITE REPORT", qualifiedReport);
    try {

        let allEmailsExisting = new Set<string>();

        const filePath = path.join(__dirname, 'prospect.xlsx');

        let workbook = new Workbook();
        if ( fs.existsSync(filePath) ) {
            console.log("file exists");
            workbook = await workbook.xlsx.readFile(filePath);
        }
        
        let worksheet: Worksheet | undefined = undefined;
        if ( workbook.getWorksheet(search) === undefined ) {
            worksheet = workbook.addWorksheet(search);
            worksheet.addRow(["emails", "subscribers", "links","send","answer","note", "ytb_id"]);
            console.log("worksheet created")
        } else {
            worksheet = workbook.getWorksheet(search);
            console.log("get worksheet")
        }


        for ( let sheet of workbook.worksheets ) {
            sheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
                if ( rowNumber > 1 ) {
                    console.log("add email existing")                        
                    allEmailsExisting.add((row as any).values[1] as string);
                }
            });
        }


        if (worksheet) {
            console.log("worksheet OK")
            qualifiedReport.forEach(report => {
                if ( report.emails ) {
                    console.log("found emails ...")
                    report.emails.forEach(email => {
                        console.log("check email : ", email)
                        if ( !allEmailsExisting.has(email) ) {
                            console.log("write : ", email);
                            worksheet?.addRow([email, report.subscribers, report.links.join(","), false, false, "", report.ytb_id])
                        }
                    });
                }
            });
            console.log("Write worksheet OK")

            await workbook.xlsx.writeFile(filePath);
        }

    } catch ( e ) {
        console.log("Error : ", e)
    }

}


// const writeReport = async (qualifiedReport: IReport[], search:string) => {

//     try {
//         const filePath = path.join(__dirname, 'prospect.xlsx');
//         const workbook = new Workbook();

//         if ( fs.existsSync(filePath) ) {
                    
//             await workbook.xlsx.readFile(filePath);

//             let emailsAlreadyHere:Set<string>| undefined = undefined;

//             let worksheet: Worksheet | undefined = undefined;

//             if ( workbook.getWorksheet(search) === undefined ) {
//                 worksheet = workbook.addWorksheet(search);
//                 worksheet.addRow(["emails", "subscribers", "links","send","answer","note", "ytb_id"]);
//             } else {
//                 worksheet = workbook.getWorksheet(search);
//             }

//             for ( let sheet of workbook.worksheets ) {
//                 sheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
//                     if ( rowNumber > 1 ) {                        

//                         if ( emailsAlreadyHere === undefined ) {
//                             emailsAlreadyHere = new Set();
//                         }
//                         emailsAlreadyHere.add((row as any).values[1] as string);
//                     }
//                 });
//             }

//             if ( worksheet !== undefined ) {
//                 qualifiedReport.forEach(report => {
//                     if ( report.emails ) {
//                         report.emails.forEach(email => {
//                             if ( emailsAlreadyHere === undefined ) {
//                                 (worksheet as Worksheet).addRow([email, report.subscribers, report.links.join(","), false, false, "", report.ytb_id])
//                             }
//                             if ( emailsAlreadyHere !== undefined && !emailsAlreadyHere.has(email) ) {
//                                 (worksheet as Worksheet).addRow([email, report.subscribers, report.links.join(","), false, false, "", report.ytb_id])
//                             }
//                         });
//                     }
//                 });
//             }


//         } else {
//             const worksheet = workbook.addWorksheet(search);
//             worksheet.addRow(["emails", "subscribers", "links","send","answer","note", "ytb_id"]);
//             qualifiedReport.forEach(report => {
//                 worksheet.addRow([report.emails.join(","), report.subscribers, report.links.join(","), false, false, "", report.ytb_id])
//             });
//         }

//         await workbook.xlsx.writeFile(filePath);

//     } catch ( e ) {
//         console.log("Error : ", e)
//     }

// }



( async ( ) => {
    sendEmail("sylvain.joly00@gmail.com");
})();

// TODO add sendEmail into parsing process
// ( async () => {

//     let search:string = "";

//     console.log("Searching influenceur for : ", process.argv[2])
    
//     MAX_PROSPECTS_PER_SEARCH = parseInt(process.argv[3]) || MAX_PROSPECTS_PER_SEARCH;

//     console.log("Max prospects per search : ", MAX_PROSPECTS_PER_SEARCH)
//     search = process.argv[2];

//     let reports: IReport[] = [];
    
//     puppeteer.use(StealthPlugin());

//     const chromeExecPath = `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`;

//     const browser = await puppeteer.launch({executablePath: chromeExecPath, headless: false}); // headless: "new"
        
//     const page = await browser.newPage();
//     await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html');
//     await page.goto('https://www.youtube.com');

//     await page.waitForSelector("input#search", {visible: true, timeout:5000});

//     await page.focus("input#search");
//     await page.type("input#search", `${search}`);

//     await page.evaluate(() => {
//         const form: HTMLFormElement | null = document.querySelector('form#search-form');
//         if (form) form.submit();
//     });

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     const elements = await page.$$('.yt-simple-endpoint.style-scope.yt-formatted-string');
//     let hrefs: string[] = [];
    
//     for (let element of elements) {
//         const href = await page.evaluate(el => el.getAttribute('href'), element);
//         hrefs=[...hrefs, `https://www.youtube.com${href}/about`]
//     }
//     hrefs = [...new Set(hrefs)];


//     let c:number = 0;
//     for (let href of hrefs) {

//         if ( c >= MAX_PROSPECTS_PER_SEARCH ) {
//             break;
//         }
        
//         let report:IReport = {
//             emails: [],
//             subscribers: 0,
//             links: [],
//             ytb_id: href
//         }

//         console.log("Go to : ", href)
//         const aboutPageResponse = await page.goto(href);

//         await delay(DELAY_PROFIL_PAGE_VISIT_MS);

//         if ( aboutPageResponse && aboutPageResponse!.status() === 200 ) { 

//             ++c;

//             try {
//                 // getting subscribers count
//                 await page.waitForSelector('#subscriber-count', {visible: true, timeout:5000});

//                 const factor:any = {
//                     "k": 10e2,
//                     "m": 10e5,
//                     "b": 10e9
//                 };
//                 let countRaw = await page.evaluate(() => (document.querySelector('#subscriber-count') as any).text.simpleText);

//                 if ( countRaw ) {
//                     let x = countRaw.split(" ")
//                     let f = factor[[...x[0]].pop().toLowerCase()]
//                     let sb = parseFloat(x[0].slice(0, -1)) * f
//                     console.log("SUBS : ", sb)
//                     report["subscribers"] = sb;
//                 } else {
//                     report["subscribers"] = 0;
//                 }

//             } catch ( e ) {
//                 console.log(e)
//             } 
 
//             // get links from about page > links
//             try {
//                 console.log("> FROM LINKS BLOCK")

//                 await page.waitForSelector('div#links-container', {visible: true, timeout:5000});

//                 const links = await page.evaluate(() => 
//                         Array.from(document.querySelectorAll('.yt-channel-external-link-view-model-wiz')).map((link:any) => link.innerText)
//                     );

//                 if ( links ) {
//                     const extractedLinks = links.map(link => link.split('\n')[1]);
//                     console.log(extractedLinks);
//                     report["links"] = extractedLinks;
//                 } else {
//                     report["links"] = [];
//                 }


//             } catch ( e ) {
//                 console.log(e);
//             }

//             console.log("--------------------------|         |-----------------------------")

//             try {
//                 await page.waitForSelector('yt-formatted-string#description', {visible: true, timeout:5000});
                
//                 // get emails from about page > description ( email )
//                 const description = await page.evaluate(() => (document.querySelector('yt-formatted-string#description') as any)?.text.simpleText);

//                 console.log("> FROM DESCRIPTINO : ")
//                 if ( description ) {

//                     console.log(description)
    
//                     const emails = description.match(emailRegex);

//                     if ( emails ) {
//                         console.log(emails)
//                         report["emails"] = emails
//                     } else {
//                         report["emails"] = []
//                     }
                    

//                 } else {
//                     console.log("> No description found")
//                     report["emails"] = []
//                 }

//             } catch ( e ) {
//                 console.log(e);
//             }

//         }

//         reports = [...reports, report];
//         console.log("===============================================")

//     }

//     console.log(reports)
//     let qualifiedReport = qualityProspect(reports)
//     if ( qualifiedReport.length > 0 ) {
//         console.log("writing report");
//         await writeReport(qualifiedReport, search)
//     } else {
//         console.log("No prospects found")
//     }

//     process.exit(0)
    
// })()