const { downloadPdf } = require('./browser');
const { getFilePath, checkDownloadDirectories, fileExists, renameFile } = require('./files');

const getDownload = async (req, res) => {
    const { busName, busCountry } = req.query;
    console.log(`Request received: ${req.headers.host} ${busName}, ${busCountry}`);

    try {
        let today = new Date();
        // remove outdated files
        await checkDownloadDirectories();

        console.log('checking if file exists');
        if (!fileExists(busName, busCountry, today)) {
            // donwload file
            result = await downloadPdf(busName, busCountry);

            if(result.match) {
                await renameFile(busName, busCountry);
            }
        }
        
        console.log('Sending Response');
        // Send the file as a response
        res.sendFile(getFilePath(busName, busCountry, today));
    }
    catch ({ message }) {
        res.status(400).send({ error: message });
    }

    console.log(`Finished processing request: ${busName}, ${busCountry}`);
}

module.exports = {
    getDownload: getDownload
}