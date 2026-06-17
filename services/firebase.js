const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');

let bucket;

try {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-adminsdk.json';
        serviceAccount = require(path.resolve(serviceAccountPath));
    }
    
    const app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: serviceAccount.project_id + '.appspot.com'
    });
    bucket = getStorage(app).bucket();
    console.log('🔥 Firebase Admin initialized successfully.');
} catch (e) {
    console.warn('⚠️ Firebase Admin failed to initialize. Check your firebase-adminsdk.json file.');
    console.warn(e.message);
}

async function uploadToFirebase(fileBuffer, originalName, mimetype) {
    if (!bucket) throw new Error('Firebase is not initialized');
    
    const ext = path.extname(originalName);
    const filename = `media/${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const file = bucket.file(filename);

    await file.save(fileBuffer, {
        metadata: { contentType: mimetype }
    });
    
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

module.exports = { bucket, uploadToFirebase };
