const puppeteer = require('puppeteer');
const appSettings = require('./configuration');
const { sleep } = require('./utilities');

async function downloadPdf(busName, busCountry) {
    let browser;
    let result = {
        match: false,
        error: '',
        queryUrl: ''
    };

    try {
        // abre o browser
        browser = await openBrowser();
        const page = await openTab(browser);

        // navega pra pagina do lexis nexis
        await page.goto(appSettings.baseUrl);
    
        // efetua login no sistema
        await loginAsync(page);
    
        // efetua busca pelo cliente
        await queryCustomerAsync(page, busName, busCountry);

        result.match = await findMatchesAsync(page);

        if(result.match) {
            await downloadMatchesReportAsync(page);
        }
        else {
            await downloadNoMatchesReportAsync(page);
        }

        result.queryUrl = page.url();

        // Close the browser after the file is downloaded
        await browser.close();
    }
    catch (ex) {
        console.error('ERROR While using the browser:' + ex);
        result.error = `${ex}`;
    }

    if (browser) 
    {
        await browser.close();
    }
    
    return result;
}

async function openBrowser() {
    return await puppeteer.launch({ 
        headless: appSettings.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-logging', '--v=1']
    });
}

async function openTab(browser) {
    const page = (await browser.pages())[0]

    if(appSettings.headless) {
        const client = await page.target().createCDPSession()
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: appSettings.defaultDownloadDirectory,
        });
    }

    return page;
}

async function loginAsync(page) {
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
}

async function queryCustomerAsync(page, busName, busCountry) {
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

    await page.click("#toolbarSubmit");
}

async function downloadMatchesReportAsync(page) {
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
    await awaitDownloadAsync(page);

    // aguarda mais um periodo p garantir o download do arquivo (necessario devido à ao antivirus do chrome)
    await sleep(100);
}

async function downloadNoMatchesReportAsync(page) {
    await page.click("#reportBtn");

    // Wait for the download to finish
    await awaitDownloadAsync(page);

    // aguarda mais um periodo p garantir o download do arquivo (necessario devido à ao antivirus do chrome)
    await sleep(100);
}

// aguarda o botao de baixar o relatorio de correspondencia encontrada, dá timeout se não há correspondência
async function findMatchesAsync(page) {
    try {
        await page.waitForSelector('#PrintSelLink');

        return true;
    }
    catch(ex){
        return false;
    }
}

async function awaitDownloadAsync(page, fileName = '') {
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

module.exports = {
    downloadPdf: downloadPdf
}