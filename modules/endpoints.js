const { downloadPdf } = require('./browser');
const { removeFile, getReportFilePath, getNoMatchFilePath, fileToBase64, checkDownloadDirectory } = require('./files');

const getDownload = async (req, res) => {
    const { busName, busCountry, busTaxId, busCountryCode } = req.query;
    console.log(`Request received: ${req.headers.host} ${busName}, ${busCountry}`);

    const validationErrors = verifyParams(req, ['busName', 'busCountry']);
    if(validationErrors) {
        res.status(400).send({ error: validationErrors });
    }

    // verifica diretorio de download (pra debugar)
    // await checkDownloadDirectory();

    try {
        let result = {
            match: false,
            queryUrl: '',
            error: ``,
            fileBase64: '' 
        };

        let reportDownloadPath = getReportFilePath();
        let noMatchDownloadPath = getNoMatchFilePath();

        // remove old files
        await removeFile(reportDownloadPath);
        await removeFile(noMatchDownloadPath);

        // faz a busca e baixa o pdf
        Object.assign(result, await downloadPdf(busName, busCountry, busTaxId, busCountryCode));
        
        // retorna erro se houve algum problema ao obter o relatorio
        if(result.error) {
            res.status(500).send(result);
            return;
        }

        if (result.match) {
            Object.assign(result, await fileToBase64(reportDownloadPath));
        }
        else {
            Object.assign(result, await fileToBase64(noMatchDownloadPath));
        }

        // retorna erro se nao foi possivel ler o arquivo
        if(result.error) {
            res.status(500).send(result);
        }
        else {
            res.status(200).send(result);
        }
    }
    catch ({ message }) {
        res.status(500).send({ error: message });
    }
}

const verifyParams = (req, requiredParams) => {
    const missingParams = requiredParams.filter(param => !req.query[param]);

    if (missingParams.length > 0) {
        return res.status(400).json({
            error: `Solicitação faltando parâmetros obrigatórios: ${missingParams.join(', ')}`
        });
    }
}

module.exports = {
    getDownload: getDownload
}