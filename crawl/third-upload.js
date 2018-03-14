const admin = require('firebase-admin');
const serviceAccount = require('../catcafe-b2d192e4fb81.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const cityHelper = {
  "catcafe_bangkok.json" : "bangkok",
  "catcafe_buenos_aires.json" : "buenos-aires",
  "catcafe_chiang_mai.json" : "chiang-mai",
  "catcafe_dublin.json" : "dublin",
  "catcafe_edinburgh.json" : "edinburgh",
  "catcafe_ho_chi_minh.json" : "ho-chi-minh",
  "catcafe_hongkong.json" : "hong-kong",
  "catcafe_istanbul.json" : "istanbul",
  "catcafe_manchester.json" : "manchester",
  "catcafe_new_york.json" : "new_york",
  "catcafe_prague.json" : "prague",
  "catcafe_rio_de_janeiro.json" : "rio-de-janeiro",
  "catcafe_saigon.json" : "saigon",
  "catcafe_shangai.json" : "shangai"
};

const db = admin.firestore();

const normalizedPath = require("path").join(__dirname, "./second-json");
const fs = require("fs");

fs.readdirSync(normalizedPath).forEach(function(file) {
  const data = require("./second-json/" + file);
  let uploaded = null, uploadedArray = null;
  try {
    uploaded = require("./third-json/" + file);
    uploadedArray = uploaded.map((x) => x.place_id);
  } catch(e){}
  upload(file, data, uploaded, uploadedArray);
});

function upload(file, data, banned, bannedArray){
  console.log("## Uploading data from : ", file, !!banned);
  let uploaded = [];
  for (var i = 0; i < data.length; i++) {
    if(!bannedArray || (data[i].place_id && !bannedArray.includes(data[i].place_id))) {
      let {country, city, toUpload} = formatData(data[i]);
      if(!city && cityHelper[file]) city = cityHelper[file];
      if(country && city && toUpload){
        let ref = db.collection('countries')
                    .doc(country)
                    .collection('cities')
                    .doc(city)
                    .collection('catcafes');
        let docRef = ref.doc();
        console.log("- ", country, city, docRef.id);
        uploaded.push({country, city, place_id: toUpload.place_id})
        docRef.set(toUpload);
      } else {
        console.log("!!!! ", country, city, toUpload);
      }
    } else if(data[i].place_id){
      console.log("* already uploaded : ", data[i].place_id);
      let index = bannedArray.indexOf(data[i].place_id);
      uploaded.push({
        country: banned[index].country,
        city: banned[index].city,
        place_id: banned[index].place_id
      });
    }
  }
  fs.writeFile('third-json/' + file, JSON.stringify(uploaded), () => {});
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
  if(toUpload.opening_hours && toUpload.opening_hours.open_now !== undefined) delete toUpload.opening_hours.open_now;

  let country = "", city = "";
  for (var i = 0; i < data.place_details.result.address_components.length; i++) {
    let comp = data.place_details.result.address_components[i];
    if(comp.types && comp.types.includes("country")) country = comp.long_name.toLowerCase().split(" ").join("-");
    if(comp.types && comp.types.includes("locality")) city = comp.long_name.toLowerCase().split(" ").join("-");
  }

  return {
    toUpload: JSON.parse(JSON.stringify(toUpload)),
    country,
    city
  };
}
