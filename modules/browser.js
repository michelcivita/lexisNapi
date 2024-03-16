const puppeteer = require('puppeteer');
const appSettings = require('./configuration');

async function downloadPdf(busName, busCountry) {
    console.log('Starting file download');
    try {
        const browser = await puppeteer.launch({ 
            headless: appSettings.headless,
            args: ['--no-sandbox'/*, '--disable-setuid-sandbox'*/]
        });
    
        console.log('Opening browser');
        const page = (await browser.pages())[0];
    
        console.log(`Navigating to ${appSettings.baseUrl}`);
        await page.goto(appSettings.baseUrl);
    
        console.log(`Logging in`);
        // Fill in form fields for clientId and username
        await page.evaluate((clientId, userName) => {
            document.getElementById('ClientId').value = clientId;
            document.getElementById('UserName').value = userName;
        }, appSettings.clientId, appSettings.userName);
    
        await Promise.all([
            page.click("#Next"),
            page.waitForNavigation()
        ]);
    
        // Fill in password field
        await page.evaluate((password) => {
            document.getElementById('Password').value = password;
        }, appSettings.password);
    
        // Click on the next button again
        await Promise.all([
            page.waitForNavigation(),
            page.click("#Next")
        ]);
    
        console.log(`Login successfull, starting customer seach`);
        // Open the search form
        await Promise.all([
            page.waitForNavigation(),
            page.click("#RealTime"),
            page.click("#realtime__0")
        ]);
    
        // Click on the business tab
        await page.click("#businessTabSelect");
    
        // Fill in form fields for customerName and customerCountry
        await page.evaluate((busName, busCountry) => {
            document.getElementById('bus-name').value = busName;
            document.getElementById('bus-cur-addr-country').value = busCountry;
        }, busName, busCountry);
    
        await Promise.all([
            page.waitForNavigation(),
            page.click("#toolbarSubmit")
        ]);
    
        await Promise.all([
            page.click("#PrintSelLink"),
            page.click("#print-select__pdf")
        ]);
    
        // aguarda o modal carregar
        await sleep(1000);
    
        await Promise.all([
            page.click("#ix-0"),
            page.click("#ix-1"),
            page.click("#ix-2")
        ]);
    
        await page.click("#pdfFormatDownloadBtn");
    
        // Wait for the download to finish
        console.log(`Report download starting`);
        await waitUntilDownload(page);
    
        // aguarda mais um periodo p garantir o download do arquivo
        await sleep(100);
        
        // Close the browser after the file is downloaded
        await browser.close();
    
        console.log('Report download finished');
    }
    catch(ex) {
        console.log('ERROR While using the browser:' + ex);
    }
}

async function waitUntilDownload(page, fileName = '') {
    return new Promise((resolve, reject) => {
        page._client().on('Page.downloadProgress', e => { // or 'Browser.downloadProgress'
            if (e.state === 'completed') {
                resolve(fileName);
            } else if (e.state === 'canceled') {
                reject();
            }
        });
    });
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = {
    downloadPdf: downloadPdf
}