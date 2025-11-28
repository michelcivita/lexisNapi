const puppeteer = require('puppeteer');
const appSettings = require('./configuration');
const { sleep } = require('./utilities');

let browser;
let page;
let browserBusy = false;
let browserInstanceHolder = null;

async function initializeBrowser(attemptNr = 0) {
    if (!await checkBrowserAvailability()) {
        try {
            await openBrowser();
			return true;
        }
		catch (error) {
			console.error(`Error opening the browser (attempt #${attemptNr + 1}):`, error);

			if (attemptNr < 5) {
				await sleep(3000);
				return await initializeBrowser(attemptNr + 1);
			}

			return false;
		}
    }
	
	console.log('browser instance available.');
	return true;
}

async function disposeBrowser() {
  if(!browser) {
	return;
  }

  console.log('Disposing of browser.');

  try {
    const pages = await browser.pages();
    for (const page of pages) {
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

async function checkBrowserAvailability() {
	if (browserBusy) {
		console.log(`Browser is busy with request: ${browserInstanceHolder}`);
		await sleep(10000);
		return checkBrowserAvailability();
	}

	if (!browser) {
		console.log('No browser instance available.');
		return false;
	}

	try {
		await browser.version(); 
		return true;
	}
	catch (error) {
		console.error('Browser is not responsive:', error);
		return false;
	}
}

async function downloadPdf(busName, busCountry, busTaxId, busCountryCode, attemptNr = 0) {
    let result = {
        match: false,
        error: '',
        queryUrl: ''
    };

    try {
		if (!await initializeBrowser()) {
			throw `Unable to initialize browser.`;
		}

		// se registra como proprietario do browser
		browserBusy = true;
		browserInstanceHolder = `${busName}${busCountry}`;

        // navega pra pagina do lexis nexis
        await page.goto(appSettings.baseUrl);

		await sleep(2000);
    
        // efetua login no sistema
        await loginAsync(page);
    
        // efetua busca pelo cliente
        await queryCustomerAsync(page, busName, busCountry, busTaxId, busCountryCode);

        result.match = await findMatchesAsync(page);

        if(result.match) {
            await downloadMatchesReportAsync(page);
        }
        else {
            await downloadNoMatchesReportAsync(page);
        }

        result.queryUrl = page.url();
    }
    catch (error) {
        console.error('ERROR While using the browser:', error);

		if(attemptNr < 3) {
			await sleep(3000);
			return await downloadPdf(busName, busCountry, busTaxId, busCountryCode, attemptNr + 1);
		}

        result.error = `${error}`;
    }
	finally {
		if(browserInstanceHolder == `${busName}${busCountry}`) {
			browserBusy = false;
			browserInstanceHolder = null;
		}
	}

    return result;
}

async function openBrowser() {
    // limpa a instancia irresponsiva se houver referencia
    await disposeBrowser().catch(() => {});
	console.log('opening browser instance');
    
    browser = await puppeteer.launch({ 
        headless: appSettings.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-logging', '--v=1']
    });

    browser.on('disconnected', async () => {
        console.warn('Browser disconnected — cleaning up');
        await disposeBrowser().catch(() => {});
    });

    page = await openTab(browser);
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

async function queryCustomerAsync(page, busName, busCountry, busTaxId, busCountryCode) {
    await Promise.all([
        page.waitForNavigation(),
        page.click("#RealTime"),
        page.click("#realtime__0")
    ]);

    await page.click("#businessTabSelect");

    // Abre o menu de campos
    await page.evaluate(() => {
        const menu = document.querySelector('#busIdCustomMenu');
        if (menu) {
            menu.style.display = 'block';
            menu.classList.remove('hideMe');
        }
    });

   // Seleciona o item Tax ID + fecha o menu
    await page.evaluate(() => {
        const item = document.querySelector('a[data-groupname="bus-other-tax"]');
        if (item) item.click();

        const menu = document.querySelector('#busIdCustomMenu');
        if (menu) {
            menu.style.display = 'none';
            menu.classList.add('hideMe');
        }
    });

    // Aguarda o HTML dos campos ser carregado na página
    await page.waitForSelector('#bus-other-tax-id-num', { visible: true });
    await page.waitForSelector('#bus-other-tax-country', { visible: true });

    // Preencher campos
    await page.evaluate((busName, busCountry, busTaxId, busCountryCode) => {
        document.getElementById('bus-name').value = busName;
        document.getElementById('bus-cur-addr-country').value = busCountry;
        document.getElementById('bus-other-tax-id-num').value = busTaxId;
        document.getElementById('bus-other-tax-country').value = busCountryCode;
    }, busName, busCountry, busTaxId, busCountryCode);

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
    downloadPdf: downloadPdf,
	dispose: disposeBrowser
}