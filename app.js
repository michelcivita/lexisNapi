const express = require('express');
const { port } = require('./modules/configuration');
const { getDownload } = require('./modules/endpoints');
const { testSelf } = require('./modules/tests');

var os = require("os");
console.log('hostname:', os.hostname());

const app = express();
app.get('/download', getDownload);

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await testSelf();
});