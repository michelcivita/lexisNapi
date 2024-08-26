const fsp = require("fs").promises;
const fs = require("fs");
const path = require('path');
const appSettings = require('./configuration');
const { sleep } = require('./utilities');

let lastClearDate = new Date();
lastClearDate.setDate(lastClearDate.getDate() - 1);

const getDownloadFilePath = (date) =>
    path.join(appSettings.defaultDownloadDirectory, appSettings.defaultFileName);

const getFilePath = (busName, busCountry, date) => 
    path.join(appSettings.defaultDownloadDirectory, getDate(date), `${busName}-${busCountry}-report-${getDate(date)}.pdf`);

const fileExists = (busName, busCountry, date) => 
    fs.existsSync(getFilePath(busName, busCountry, date));
    

const renameFile = async (busName, busCountry) => {
    const a = getDownloadFilePath();
    const b = getFilePath(busName, busCountry, new Date());
    console.log(`Renaming file ${a} to ${b}`);

    await fsp.rename(a, b, (err) => {
        if ( err ) console.log('renameFile ERROR: ' + err);
    });
}

const checkDownloadDirectories = async () => {
    const today = new Date();

    console.log('checking default path:');
    await checkDirectory(appSettings.defaultDownloadDirectory);
    console.log('checking today´s path:');
    await checkDirectory(path.join(appSettings.defaultDownloadDirectory, getDate(today)));

    if (datediff(lastClearDate, today) != 0) {
        const oldPath = path.join(appSettings.defaultDownloadDirectory, getDate(lastClearDate));
        console.log('removing old files:');

        let done = false;

        fsp.rmdir(oldPath, (err) => {
            if(err) {
                console.log('checkDownloadDirectory ERROR:', err);
            }
            done = true;
        });

        lastClearDate = today;

        while(!done) {
            await(sleep(100));
        }
    }
}

const checkDirectory = async (directory) => {
    let done = false;

    if((await checkExists(directory))) {
        fsp.readdir(directory, (err, files) => {
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
            await fsp.mkdir(directory, () => {
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

const removeFile = async(path) => {
    if (await checkExists(path)) {
        await fsp.unlink(path, (err) => {
            if (err) {
              console.error('Error deleting the file:', err);
            } else {
              console.log('File deleted successfully!');
            }
          });
    }
}

const checkExists = async (path) => {
    let done = false;
    let result = false;

    fs.exists(path, (exists) => {
        done = true;
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

function getDate(date) {
    if(!date) {
        date = new Date();
    }

    var today = date;
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    return `${yyyy}${mm}${dd}`;
}

async function fileToBase64(filePath) {
    try {
      // Read file data asynchronously
      const fileData = await fsp.readFile(filePath);
      
      // Convert the file data to a base64 string
      return fileData.toString('base64');
    } catch (error) {
      console.error('Error reading the file:', error);
    }
  }

module.exports = {
    getDownloadFilePath: getDownloadFilePath,
    getFilePath: getFilePath,
    checkDownloadDirectories: checkDownloadDirectories,
    fileExists: fileExists,
    renameFile: renameFile,
    removeFile: removeFile,
    fileToBase64: fileToBase64
}