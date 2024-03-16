const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { port } = require('./modules/configuration');
const { getDownload } = require('./modules/endpoints');
const { testSelf } = require('./modules/tests');
const fs = require('fs');

const app = express();

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Lexis-Nexis-Api',
            description: 'API para automatizar a obtenção de relatórios da Lexis Nexis',
            servers: [`http://localhost:${port}`]
        }
    },
    apis: ['app.js']
}



const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
/**
 * @swagger
 * /download:
 *   get:
 *     description: Busca o relatório do cliente informado.
 *     parameters:
 *       - in: query
 *         name: busName
 *         schema:
 *           type: string
 *         description: O cliente a ser consultado
 *       - in: query
 *         name: busCountry
 *         schema:
 *           type: string
 *         description: O país a ser consultado
 */
app.get('/download', getDownload);

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    // try{
    //     await testSelf();
    // }catch(e){
    //     console.log('error testSelf', e);
    // }
    
    try{
        // var a = fs.readdirSync('/home');
        console.log(fs.readdirSync('/home/pptruser/', {recursive:true}));
        console.log(fs.readdirSync('/home/pptruser/.profile', {recursive:true}));
        console.log(fs.readdirSync('/home/pptruser/.cache/puppeteer', {recursive:true}));
        // var c = fs.readdirSync('/home/node');
        // console.log('readdirSync', a);
        // console.log('readdirSync', c);
    }
    catch(ex){
        console.log(ex);
    }
});