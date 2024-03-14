const { downloadPdf } = require('./browser');
const { getFilePath, disposeOldFiles, fileExists, renameFile } = require('./files');

const getDownload = async (req, res) => {
    const { busName, busCountry, forceDownload } = req.query;
    console.log(`Request received: ${req.headers.host} ${busName}, ${busCountry}`);

    try {
        // remove outdated files
        await disposeOldFiles(busName, busCountry);

        // if (forceDownload || !fileExists(busName, busCountry)) {
            // donwload file
            await downloadPdf(busName, busCountry);
            await renameFile(busName, busCountry);
        // }
        
        console.log('Sending Response');
        // Send the file as a response
        res.sendFile(getFilePath(busName, busCountry));
    }
    catch ({ message }) {
        res.status(400).send({ error: message });
    }

    console.log(`Finished processing request: ${busName}, ${busCountry}`);
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = {
    getDownload: getDownload
}