import PouchDB from "pouchdb-browser";

const localDb = new PouchDB("syncboard-local");

localDb
  .info()
  .then((info) => {
    console.log("✅ PouchDB is working:", info);
  })
  .catch((error) => {
    console.error("❌ PouchDB error:", error);
  });

export default localDb;