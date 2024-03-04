const express = require('express');
const { port } = require('./modules/configuration');
const { getDownload } = require('./modules/endpoints');

const app = express();
app.get('/download', getDownload);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});