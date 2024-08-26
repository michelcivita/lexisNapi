const { downloadPdf } = require('./browser');
const { removeFile, getDownloadFilePath, fileToBase64 } = require('./files');

const getDownload = async (req, res) => {
    const { busName, busCountry } = req.query;
    console.log(`Request received: ${req.headers.host} ${busName}, ${busCountry}`);

    try {
        let result = {
            match: false,
            queryUrl: '',
            error: ``,
            fileBase64: '' 
        };

        let downloadPath = getDownloadFilePath();

        // remove old file
        await removeFile(downloadPath);

        // faz a busca e baixa o pdf
        Object.assign(result, await downloadPdf(busName, busCountry));
        
        // retorna erro se houve algum problema ao obter o relatorio
        if(result.error) {
            res.status(500).send(result);
        }

        result.fileBase64 = await fileToBase64(downloadPath);

        res.status(200).send(result);
    }
    catch ({ message }) {
        res.status(400).send({ error: message });
    }

    console.log(`Finished processing request: ${busName}, ${busCountry}`);
}

module.exports = {
    getDownload: getDownload
}