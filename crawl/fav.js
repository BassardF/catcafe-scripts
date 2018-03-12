const admin = require('firebase-admin');
const serviceAccount = require('../catcafe-b2d192e4fb81.json');
const fs = require("fs");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const filePath = 'cafe_chat_lyon.json';
const placeId = 'ChIJW7u1RrPr9EcRLgkNWC-LFYI';

const data = require("./second-json/" + filePath);

if(data){
  for (var i = 0; i < data.length; i++) {
    if(data[i].place_id === placeId) upload(filePath, placeId, data[i]);
  }
}

function upload(file, placeId, data){
  console.log("## Uploading data from : ", file);
  let toUpload = formatData(data);
  let ref = db.collection('fav');
  let docRef = ref.doc();
  console.log("- placeId / docId : ", placeId, docRef.id);
  docRef.set(toUpload);
  fs.writeFile(`fav-json/${placeId}.json`, new Date().getTime(), 'utf8');
}


function formatData(data){
  let toUpload = {
    name: data.name,
    place_id: data.place_id,
    rating: data.rating,
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
