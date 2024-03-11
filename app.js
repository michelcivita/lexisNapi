const express = require('express');
const { port } = require('./modules/configuration');
const { getDownload } = require('./modules/endpoints');
// const { testSelf } = require('./modules/tests');

const app = express();
app.get('/download', getDownload);

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    // await testSelf();
});