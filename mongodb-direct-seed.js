// Direct MongoDB seed script using the MongoDB driver
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const uri = process.env.DATABASE_URI || 'mongodb://127.0.0.1/event-booking-system';

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Clear existing collections
    console.log('Clearing existing collections...');
    await db.collection('tenants').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('events').deleteMany({});
    await db.collection('bookings').deleteMany({});

    // Create tenants
    console.log('Creating tenants...');
    const tenantsResult = await db.collection('tenants').insertMany([
      {
        name: 'TechConf Inc.',
        createdAt: new Date()
      },
      {
        name: 'MusicFest LLC',
        createdAt: new Date()
      }
    ]);

    const tenant1Id = tenantsResult.insertedIds[0];
    const tenant2Id = tenantsResult.insertedIds[1];

    // Generate password hash and salt using Payload's method (pbkdf2)
    
    // Function to generate random bytes for salt
    function randomBytes() {
      return new Promise((resolve, reject) =>
        crypto.randomBytes(32, (err, saltBuffer) => (err ? reject(err) : resolve(saltBuffer)))
      );
    }
    
    // Function to hash password using pbkdf2 (same as Payload CMS)
    function pbkdf2Promisified(password, salt) {
      return new Promise((resolve, reject) =>
        crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, hashRaw) =>
          err ? reject(err) : resolve(hashRaw)
        )
      );
    }
    
    // Generate salt and hash
    const saltBuffer = await randomBytes();
    const salt = saltBuffer.toString('hex');
    const hashRaw = await pbkdf2Promisified('password123', salt);
    const hash = hashRaw.toString('hex');

    // Create users
    console.log('Creating users...');
    
    // Admin users
    await db.collection('users').insertMany([
      {
        email: 'admin1@techconf.com',
        name: 'Admin TechConf',
        role: 'admin',
        tenant: tenant1Id,
        salt: salt,
        hash: hash,
        _verified: true,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin2@musicfest.com',
        name: 'Admin MusicFest',
        role: 'admin',
        tenant: tenant2Id,
        salt: salt,
        hash: hash,
        _verified: true,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Organizer users
    await db.collection('users').insertMany([
      {
        email: 'organizer1@techconf.com',
        name: 'Organizer TechConf',
        role: 'organizer',
        tenant: tenant1Id,
        salt: salt,
        hash: hash,
        _verified: true,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'organizer2@musicfest.com',
        name: 'Organizer MusicFest',
        role: 'organizer',
        tenant: tenant2Id,
        salt: salt,
        hash: hash,
        _verified: true,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Attendee users for tenant 1
    const attendees1 = [];
    for (let i = 1; i <= 5; i++) {
      attendees1.push({
        email: `attendee${i}@techconf.com`,
        name: `Attendee ${i} TechConf`,
        role: 'attendee',
        tenant: tenant1Id,
        salt: salt,
        hash: hash,
        _verified: true,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    await db.collection('users').insertMany(attendees1);

    // Attendee users for tenant 2
    const attendees2 = [];
    for (let i = 1; i <= 5; i++) {
      attendees2.push({
        email: `attendee${i}@musicfest.com`,
        name: `Attendee ${i} MusicFest`,
        role: 'attendee',
        tenant: tenant2Id,
        salt: salt,
        hash: hash,
        _verified: true,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    await db.collection('users').insertMany(attendees2);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seed process:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seed();