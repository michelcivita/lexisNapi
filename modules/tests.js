const http = require('http');
const { port } = require('./configuration');

const testSelf = async() => {
    console.log('sending request to self');
    http.get(`http://127.0.0.1:${port}/download?busName=Equatorial&busCountry=Brazil`, res => {
      let data = [];
      const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
      console.log('Status Code:', res.statusCode);
      console.log('Date in Response header:', headerDate);
    
      res.on('data', chunk => {
        data.push(chunk);
      });
    
      res.on('end', () => {
        console.log('Response ended: ', data);
      });
    }).on('error', err => {
      console.log('Error: ', err.message);
    });
}

module.exports = {
    testSelf: testSelf
}
