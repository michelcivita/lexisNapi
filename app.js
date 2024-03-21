const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { port } = require('./modules/configuration');
const { getDownload } = require('./modules/endpoints');

const app = express();

// route not found
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.message = 'Invalid route';
    error.status = 404;
    next(error);
   });

  // log errors to console
   app.use(logErrors);
    //
   app.use(clientErrorHandler);
   app.use((error, req, res, next) => {
   res.status(error.status || 500);
     return res.json({
     status:error.status || 500,
     message: error.message,
     error: {
     error: error.message,
     },
   });
  });

// log errors to console
function logErrors(err, req, res, next) {
 console.error(err.stack);
 next(err);
}

// error handling for xhr request
function clientErrorHandler(err, req, res, next) {
 if (req.xhr) {
   //console.log('xhr request');
   res.status(400).send({status: 400, message: "Bad request from client", error: err.message });
 } else {
   next(err);
 }
}

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

app.listen(80, async () => {
    console.log(`Server is running on port ${port}`);
});