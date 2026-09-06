import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

export async function connectDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set in your .env file');
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'syncboard', // Force Mongoose to use the syncboard database
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected to syncboard');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}