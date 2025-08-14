import dotenv from 'dotenv';
import path from 'path';
import payload from 'payload';
import { fileURLToPath } from 'url';
import config from './payload.config.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cached = (global).payload;

if (!cached) {
  cached = (global).payload = {
    client: null,
    promise: null,
  };
}

export const getPayload = async () => {
  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    cached.promise = payload.init({
      secret: process.env.PAYLOAD_SECRET || '',
      mongoURL: process.env.DATABASE_URI || '',
      config,
    });
  }

  try {
    cached.client = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.client;
};