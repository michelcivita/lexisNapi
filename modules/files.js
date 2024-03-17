const fs = require("fs");
const path = require('path');
const appSettings = require('./configuration');
const { sleep } = require('./utilities');

let lastClearDate = new Date();

const getDownloadFilePath = (date) =>
    path.join(appSettings.defaultDownloadDirectory, appSettings.defaultFileName);

const getFilePath = (date, busName, busCountry) => 
    path.join(appSettings.defaultDownloadDirectory, getDate(date), `${busName}-${busCountry}-report-${getDate(date)}.pdf`);

const fileExists = (busName, busCountry) => 
    fs.existsSync(getFilePath(busName, busCountry));

const renameFile = async (busName, busCountry) =>
    await fs.rename(getDownloadFilePath(), getFilePath(busName, busCountry), (err) => {
        if ( err ) console.log('renameFile ERROR: ' + err);
    });

const checkDownloadDirectories = async () => {
    let done = false;
    const today = new Date();

    console.log('checking default path:');
    await checkDirectory(appSettings.defaultDownloadDirectory);
    console.log('checking today´s path:');
    await checkDirectory(path.join(appSettings.defaultDownloadDirectory, getDate(today)));

    if (datediff(lastClearDate, today) != 0) {
        const oldPath = path.join(appSettings.defaultDownloadDirectory, getDate(lastClearDate));
        console.log('removing old files:');

        fs.rmdir(oldPath, (err) => {
            if(err) {
                console.log('checkDownloadDirectory ERROR:', err);
            }
            done = true;
        });

        lastClearDate = today;
    }

    while(!done) {
        await(sleep(100));
    }
}

const checkDirectory = async (directory) => {
    let done = false;

    if((await checkExists(directory))) {
        fs.readdir(directory, (err, files) => {
            done = true;
            if (err) {
                console.log('checkDirectory ERROR: ', err); 
            }
            else {
                console.log(`checkDirectory ${directory} items:`, files);
            }
        });
    }
    else {
        try {
            fs.mkdir(directory, () => {
                done = true;
                console.log(`checkDirectory ${directory} created`);
            });
        }
        catch {
            done = true;
        }
    }
    
    while(!done) {
        await(sleep(100));
    }
}

const checkExists = async (path) => {
    let done = false;
    let result = false;

    fs.exists(path, (exists) => {
        done = false;
        result = exists;
    });
    
    while(!done) {
        await(sleep(100));
    }

    return result;
}

function datediff(first, second) {        
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

function getDate(date = new Date()) {
    var today = date;
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    return `${yyyy}${mm}${dd}`;
}

module.exports = {
    getDownloadFilePath: getDownloadFilePath,
    getFilePath: getFilePath,
    checkDownloadDirectories: checkDownloadDirectories,
    fileExists: fileExists,
    renameFile: renameFile
}