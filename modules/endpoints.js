const { downloadPdf } = require('./browser');
const { getFilePath, checkDownloadDirectories, fileExists, renameFile } = require('./files');

const getDownload = async (req, res) => {
    const { busName, busCountry } = req.query;
    console.log(`Request received: ${req.headers.host} ${busName}, ${busCountry}`);

    try {
        // remove outdated files
        await checkDownloadDirectories();

        if (!fileExists(busName, busCountry)) {
            // donwload file
            await downloadPdf(busName, busCountry);
            await renameFile(busName, busCountry);
        }
        
        console.log('Sending Response');
        // Send the file as a response
        res.sendFile(getFilePath(busName, busCountry));
    }
    catch ({ message }) {
        res.status(400).send({ error: message });
    }

    console.log(`Finished processing request: ${busName}, ${busCountry}`);
}

module.exports = {
    getDownload: getDownload
}