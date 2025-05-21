const path = require('path');

const admin = require('firebase-admin');
const serviceAccount = require(path.join(__dirname, 'Adicione aqui a chave da sua Firebase!'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
module.exports = db;
