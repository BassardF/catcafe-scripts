const admin = require('firebase-admin');
const serviceAccount = require('../catcafe-b2d192e4fb81.json');
const toUpload = require('./upload.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

for (let country in toUpload) {
  for(let city in toUpload[country]){
    let ref = db.collection('countries')
                .doc(country)
                .collection('cities')
                .doc(city)
                .collection('catcafes');
    for (let i = 0; i < toUpload[country][city].length; i++) {
      let docRef = ref.doc();
      docRef.set(toUpload[country][city][i]);
    }
  }
}
