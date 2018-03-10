const admin = require('firebase-admin');
const serviceAccount = require('../catcafe-b2d192e4fb81.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const fs = require('fs');
const db = admin.firestore();

const fetch = require('node-fetch');
const queries = require('./queries.json');

const GOOGLE_PLACES_API_KEY = "AIzaSyD-p7FodgtCx3iZMKWf0_FjJPAjG6kJo5k";
const GOOGLE_PLACES_OUTPUT_FORMAT = "json";


for (var i = 0; i < queries.length; i++) {
  fetchQueryText(GOOGLE_PLACES_OUTPUT_FORMAT, GOOGLE_PLACES_API_KEY, queries[i]);
}

function fetchQueryText(format, key, query){
  fetch(`https://maps.googleapis.com/maps/api/place/textsearch/${format}?key=${key}&query=${query}`).then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        return;
      }
      // Examine the text in the response
      response.json().then(function(data) {
        fs.writeFile('json/'+query.split(' ').join('_')+'.json', JSON.stringify(data), 'utf8');
      });
    }
  ).catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}
