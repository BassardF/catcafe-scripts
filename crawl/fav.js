const admin = require('firebase-admin');
const serviceAccount = require('../catcafe-b2d192e4fb81.json');
const fs = require("fs");
const fetch = require('node-fetch');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const GOOGLE_PLACES_API_KEY = "AIzaSyD-p7FodgtCx3iZMKWf0_FjJPAjG6kJo5k";

const db = admin.firestore();
const filePath = 'cafe_chat_lyon.json';
const placeIds = ['ChIJW7u1RrPr9EcRLgkNWC-LFYI', 'ChIJycicC0Xq9EcRMeSB5IkvznM'];

const data = require("./second-json/" + filePath);

if(data){
  for (var i = 0; i < data.length; i++) {
    if(placeIds.includes(data[i].place_id)) upload(filePath, data[i].place_id, data[i]);
  }
}

function fetchPictures(data, cb){
  let cst = 0;
  data.place_details.result.photos.sort(function(a, b){
    const aRatio = Math.abs((a.width / a.height) - (2/3));
    const bRatio = Math.abs((b.width / b.height) - (2/3));
    return aRatio > bRatio ? -1 : 1;
  });
  for (var i = 0; i < data.place_details.result.photos.length; i++) {
    (function(i){
      fetch(`https://maps.googleapis.com/maps/api/place/photo?key=${GOOGLE_PLACES_API_KEY}&photoreference=${data.place_details.result.photos[i].photo_reference}&maxheight=600&maxwidth=600`).then(
        (response) => {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
          }
          cst++;
          data.place_details.result.photos[i].ratio = data.place_details.result.photos[i].width / data.place_details.result.photos[i].height;
          data.place_details.result.photos[i].url = response.url;
          if(cst === data.place_details.result.photos.length) cb(data);
        }
      ).catch(function(err) {
        console.log('Fetch Error :-S', err);
      });
    })(i);
  }
}

function upload(file, placeId, data){
  for (var i = 0; i < data.place_details.result.address_components.length; i++) {
    let comp = data.place_details.result.address_components[i];
    if(comp.types && comp.types.includes("country")) data.country = comp.long_name.toLowerCase().split(" ").join("-");
    if(comp.types && comp.types.includes("locality")) data.city = comp.long_name.toLowerCase().split(" ").join("-");
  }
  fetchPictures(data, function(data){
    console.log("## Uploading data from : ", file);
    let toUpload = formatData(data);
    let ref = db.collection('fav');
    let docRef = ref.doc();
    console.log("- placeId / docId : ", placeId, docRef.id);
    docRef.set(toUpload);
    fs.writeFile(`fav-json/${placeId}.json`, new Date().getTime(), 'utf8');
  });
}

function formatData(data){
  let toUpload = {
    name: data.name,
    place_id: data.place_id,
    rating: data.rating,
    country: data.country,
    city: data.city,
    address: data.formatted_address,
    geo: [data.geometry.location.lat, data.geometry.location.lng],
    formatted_phone_number: data.place_details.result.formatted_phone_number,
    international_phone_number: data.place_details.result.international_phone_number,
    opening_hours: data.place_details.result.opening_hours,
    website: data.place_details.result.website,
    photos: data.place_details.result.photos
  };
  delete toUpload.opening_hours.open_now;
  return toUpload;
}
