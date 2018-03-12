const admin = require('firebase-admin');
const serviceAccount = require('../catcafe-b2d192e4fb81.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const normalizedPath = require("path").join(__dirname, "./second-json");
const fs = require("fs");

fs.readdirSync(normalizedPath).forEach(function(file) {
  const data = require("./second-json/" + file);
  upload(file, data);
});

function upload(file, data){
  console.log("## Uploading data from : ", file);
  let uploaded = [];
  for (var i = 0; i < data.length; i++) {
    let {country, city, toUpload} = formatData(data[i]);

    let ref = db.collection('countries')
                .doc(country)
                .collection('cities')
                .doc(city)
                .collection('catcafes');
    let docRef = ref.doc();
    console.log("- ", country, city, docRef.id);
    uploaded.push({country, city, place_id: toUpload.place_id})
    docRef.set(toUpload);
  }
  fs.writeFile('third-json/' + file, JSON.stringify(uploaded), 'utf8');
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
    website: data.place_details.result.website
  };
  delete toUpload.opening_hours.open_now;

  let country = "", city = "";
  for (var i = 0; i < data.place_details.result.address_components.length; i++) {
    let comp = data.place_details.result.address_components[i];
    if(comp.types && comp.types.includes("country")) country = comp.long_name.toLowerCase().split(" ").join("-");
    if(comp.types && comp.types.includes("locality")) city = comp.long_name.toLowerCase().split(" ").join("-");
  }

  return {toUpload, country, city};
}
