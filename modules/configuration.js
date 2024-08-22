const configs = {
    defaultDownloadDirectory: '/home/pptruser/Downloads',
    defaultFileName: 'Result.pdf',
    headless: false,
    baseUrl: 'https://bridger.lexisnexis.eu',
    clientId: 'LIGSLIMITEDGB',   
    userName: 'MDaniel01',
    password: 'Lockton.102',
    port: 80
}

const configsDev = {
    defaultDownloadDirectory: `${process.env.USERPROFILE}/Downloads`,
    defaultFileName: 'Resultados.pdf',
    headless: false,
    baseUrl: 'https://bridger.lexisnexis.eu',
    clientId: 'LIGSLIMITEDGB',   
    userName: 'MDaniel01',
    password: 'Lockton.102',
    port: 8000
}

module.exports = configs;