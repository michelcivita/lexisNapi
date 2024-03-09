const https = require('https');
const { port } = require('./modules/configuration');

const testSelf = async() => {
    console.log('sending request to self');
    https.get(`http://127.0.0.1:${port}/download?busName=Equatorial&busCountry=Brazil`, res => {
      let data = [];
      const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
      console.log('Status Code:', res.statusCode);
      console.log('Date in Response header:', headerDate);
    
      res.on('data', chunk => {
        data.push(chunk);
      });
    
      res.on('end', () => {
        console.log('Response ended: ');
        const users = JSON.parse(Buffer.concat(data).toString());
    
        for(user of users) {
          console.log(`Got user with id: ${user.id}, name: ${user.name}`);
        }
      });
    }).on('error', err => {
      console.log('Error: ', err.message);
    });
}

module.exports = {
    testSelf
}
