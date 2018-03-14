const fs = require('fs');

const fetch = require('node-fetch');
const queries = require('./queries.json');

const GOOGLE_PLACES_API_KEY = "AIzaSyD-p7FodgtCx3iZMKWf0_FjJPAjG6kJo5k";
const GOOGLE_PLACES_OUTPUT_FORMAT = "json";

const banlist = require('./place-id-banlist.json');

const normalizedPath = require("path").join(__dirname, "./json");

var dc = 0, counts = {};
fs.readdirSync(normalizedPath).forEach(function(file) {
  const data = require("./json/" + file);
  secondCrawl(file, data);
});
// const path = 'cafe_chat_lyon.json';
// const data = require('./json/'+path);

function secondCrawl(file, data){
  let results = [], target = 0;

  if(data.results){
    target = data.results.length;
    counts[file] = 0;
    for (var i = 0; i < data.results.length; i++) {
      if (data.results[i].place_id && !banlist.includes(data.results[i].place_id)) {
        fetchDetails(GOOGLE_PLACES_OUTPUT_FORMAT, GOOGLE_PLACES_API_KEY, data.results[i], results, file, target);
      }
    }
  }
}

function fetchDetails(format, key, place, results, file, target){
  console.log(`https://maps.googleapis.com/maps/api/place/details/${format}?key=${key}&placeid=${place.place_id}`);
  fetch(`https://maps.googleapis.com/maps/api/place/details/${format}?key=${key}&placeid=${place.place_id}`)
  .then((response) => {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' + response.status);
      return;
    }
    // Examine the text in the response
    response.json().then(function(data) {
      place.place_details = data;
      results.push(place);
      counts[file]++;
      if(counts[file] == target) output(results, file);
      else console.log(counts[file] , target);
    }).catch(function(err) {
      console.log('Sec Fetch Error :-S', err);
    });
  }).catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}

function output(results, file){
  fs.writeFile('second-json/' + file, JSON.stringify(results), 'utf8');
}
