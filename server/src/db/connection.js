import mongoose from 'mongoose';
import { config } from '../config.js';

let isMongoConnected = false;

export async function connectDB() {
  if (!config.mongoUri) {
    console.log('[Database] MONGODB_URI not set. Running with built-in persistent store (Zero-Setup Mode).');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('[Database] MongoDB Atlas connected successfully.');
    return true;
  } catch (error) {
    console.warn('[Database] MongoDB connection failed:', error.message);
    console.log('[Database] Falling back seamlessly to built-in store.');
    isMongoConnected = false;
    return false;
  }
}

export function isConnected() {
  return isMongoConnected;
}
