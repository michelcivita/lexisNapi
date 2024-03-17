const http = require('http');
const { port } = require('./configuration');
const { sleep } = require('./utilities');

const testSelf = async() => {
    let ended = false;
    http.get(`http://localhost:${port}/download?busName=Equatorial&busCountry=Brazil`, res => {
      let data = [];
      const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    
      res.on('data', chunk => {
        data.push(chunk);
      });
    
      res.on('end', () => {
        ended = true;
      });
    }).on('error', err => {
      ended = true;
    });

    while(!ended){
      await sleep(1000);
    }
}

module.exports = {
    testSelf: testSelf
}
