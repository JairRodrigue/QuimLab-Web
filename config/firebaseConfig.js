import admin from "firebase-admin";
import { readFile } from "fs/promises";

const serviceAccount = JSON.parse(
  await readFile(new URL("../serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "quimlab-b35f1.appspot.com",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

export { db, bucket };