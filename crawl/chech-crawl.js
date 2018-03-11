const normalizedPath = require("path").join(__dirname, "./json");
const fs = require("fs");

fs.readdirSync(normalizedPath).forEach(function(file) {
  const data = require("./json/" + file);
  checkValidity(file, data);
});

function checkValidity(file, data){
  console.log('\x1b[36m%s\x1b[0m', '#######  ' + file.replace('.json', '').toUpperCase());
  if(!data.results || !data.results.length) console.log('no results');
  else {
    for (let i = 0; i < data.results.length; i++) {
      const res = data.results[i];
      const type = res.types && res.types.length ? res.types.includes('cafe') : null;
      console.log("\x1b[31m", res.name);
      if (!type) console.log('"\x1b[30m"', '\r\r ', "Type 'cafe' no included in place types !");
      console.log('"\x1b[30m"', '\r\r\r\r\r\r ', `https://www.google.com/maps/place/?q=place_id:${res.place_id}`);
    }
  }

}
