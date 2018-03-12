const fs = require('fs');

const fetch = require('node-fetch');
const queries = require('./queries.json');

const GOOGLE_PLACES_API_KEY = "AIzaSyD-p7FodgtCx3iZMKWf0_FjJPAjG6kJo5k";
const GOOGLE_PLACES_OUTPUT_FORMAT = "json";

// const normalizedPath = require("path").join(__dirname, "./json");
//
// fs.readdirSync(normalizedPath).forEach(function(file) {
//   const data = require("./json/" + file);
//   checkValidity(file, data);
// });
const path = 'cafe_chat_lyon.json';
const data = require('./json/'+path);
let results = [], count = 0, target = 0;

if(data.results){
  target = data.results.length;
  for (var i = 0; i < data.results.length; i++) {
    fetchDetails(GOOGLE_PLACES_OUTPUT_FORMAT, GOOGLE_PLACES_API_KEY, data.results[i]);
  }
}

function fetchDetails(format, key, place){
  fetch(`https://maps.googleapis.com/maps/api/place/details/${format}?key=${key}&placeid=${place.place_id}`).then(
    (response) => {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        return;
      }
      // Examine the text in the response
      response.json().then(function(data) {
        place.place_details = data;
        results.push(place);
        count++;
        if(count == target) output();
        else console.log(count , target);
      });
    }
  ).catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}

function output(){
  fs.writeFile('second-json/' + path, JSON.stringify(results), 'utf8');
}
