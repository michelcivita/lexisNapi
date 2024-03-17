const fs = require("fs");
const path = require('path');
const appSettings = require('./configuration');

let lastClearDate = null;

const getDownloadFilePath = () =>
    path.join(appSettings.defaultDownloadDirectory, appSettings.defaultFileName);

const getFilePath = (busName, busCountry) => 
    path.join(appSettings.defaultDownloadDirectory, `${busName}-${busCountry}-report-${getDate()}.pdf`);

const fileExists = (busName, busCountry) => 
    fs.existsSync(getFilePath(busName, busCountry));

const renameFile = async (busName, busCountry) =>
    await fs.rename(getDownloadFilePath(), getFilePath(busName, busCountry), (err) => {
        if ( err ) console.log('renameFile ERROR: ' + err);
    });

const disposeOldFiles = async(busName, busCountry) => {
    try {
        const oldFiles = [];
        fs.readdir(appSettings.defaultDownloadDirectory, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            
            files.forEach(function (file) {
                if (file.startsWith(`${busName}-${busCountry}-report-`) && !file.endsWith(`${getDate()}.pdf`)) {
                    oldFiles.push(file);
                }
            });

            if (oldFiles.length > 0) {
                console.log(`${oldFiles.length} old files found, deleting...`);
                for (let i = oldFiles.length - 1; i >= 0; i--) {
                    fs.unlinkSync(path.join(appSettings.defaultDownloadDirectory, oldFiles[i]), (err2) => {
                        if (err2) {
                            console.error(err2);
                        } else {
                            console.log(`${oldFiles[i]}File is deleted.`);
                        }
                    });
                }
            }
        });
    }
    catch({message}){
        console.log(message);
    }
}

function getDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    return `${yyyy}${mm}${dd}`;
}

module.exports = {
    getDownloadFilePath: getDownloadFilePath,
    getFilePath: getFilePath,
    disposeOldFiles: disposeOldFiles,
    fileExists: fileExists,
    renameFile: renameFile
}