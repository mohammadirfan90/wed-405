const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set in .env');
  mongoose.set('strictQuery', true);

  // Log the resolved database name before we connect so a wrong trailing
  // path is obvious in the boot log (e.g. "Connected: test" usually means
  // the URI ends with "/?ssl=..." instead of "/<dbname>?ssl=...").
  const parsed = parseMongoUri(uri);
  if (parsed?.dbName) console.log(`[db] Target database: ${parsed.dbName}`);

  await mongoose.connect(uri);
  console.log(`[db] Connected: ${mongoose.connection.name}`);
}

// Best-effort parser — extracts the database name from a mongodb+srv:// or
// mongodb:// URI without pulling in another dependency. Returns null parts
// when the path is empty (which is what caused the silent "test" fallback).
function parseMongoUri(uri) {
  try {
    const schemeEnd = uri.indexOf('://');
    if (schemeEnd < 0) return null;
    const afterScheme = uri.slice(schemeEnd + 3);
    const pathStart = afterScheme.indexOf('/');
    if (pathStart < 0) return { dbName: null };
    const path = afterScheme.slice(pathStart + 1).split('?')[0];
    return { dbName: path || null };
  } catch {
    return null;
  }
}

module.exports = connectDB;
