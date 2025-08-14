import { Payload } from 'payload'
import { getPayload } from '../payload.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export const seed = async (payload: Payload) => {
  // Create tenants
  const tenant1 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'TechConf Inc.',
    },
  })

  const tenant2 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'MusicFest LLC',
    },
  })

  // Create admin users
  const admin1 = await payload.create({
    collection: 'users',
    data: {
      email: 'admin1@techconf.com',
      name: 'Admin TechConf',
      password: 'password123',
      role: 'admin',
      tenant: tenant1.id,
    },
  })

  const admin2 = await payload.create({
    collection: 'users',
    data: {
      email: 'admin2@musicfest.com',
      name: 'Admin MusicFest',
      password: 'password123',
      role: 'admin',
      tenant: tenant2.id,
    },
  })

  // Create organizer users
  const organizer1 = await payload.create({
    collection: 'users',
    data: {
      email: 'organizer1@techconf.com',
      name: 'Organizer TechConf',
      password: 'password123',
      role: 'organizer',
      tenant: tenant1.id,
    },
  })

  const organizer2 = await payload.create({
    collection: 'users',
    data: {
      email: 'organizer2@musicfest.com',
      name: 'Organizer MusicFest',
      password: 'password123',
      role: 'organizer',
      tenant: tenant2.id,
    },
  })

  // Create attendee users
  const attendees1 = []
  for (let i = 1; i <= 10; i++) {
    const attendee = await payload.create({
      collection: 'users',
      data: {
        email: `attendee${i}@techconf.com`,
        name: `Attendee ${i} TechConf`,
        password: 'password123',
        role: 'attendee',
        tenant: tenant1.id,
      },
    })
    attendees1.push(attendee)
  }

  const attendees2 = []
  for (let i = 1; i <= 10; i++) {
    const attendee = await payload.create({
      collection: 'users',
      data: {
        email: `attendee${i}@musicfest.com`,
        name: `Attendee ${i} MusicFest`,
        password: 'password123',
        role: 'attendee',
        tenant: tenant2.id,
      },
    })
    attendees2.push(attendee)
  }

  // Create events for tenant 1
  const event1 = await payload.create({
    collection: 'events',
    data: {
      title: 'Web Development Workshop',
      description: [
        {
          children: [
            {
              text: 'Learn the latest web development techniques and tools.',
            },
          ],
        },
      ],
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      capacity: 5,
      organizer: organizer1.id,
      tenant: tenant1.id,
    },
  })

  const event2 = await payload.create({
    collection: 'events',
    data: {
      title: 'AI and Machine Learning Conference',
      description: [
        {
          children: [
            {
              text: 'Explore the cutting-edge advancements in AI and machine learning.',
            },
          ],
        },
      ],
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      capacity: 3,
      organizer: organizer1.id,
      tenant: tenant1.id,
    },
  })

  // Create events for tenant 2
  const event3 = await payload.create({
    collection: 'events',
    data: {
      title: 'Rock Concert',
      description: [
        {
          children: [
            {
              text: 'An amazing rock concert featuring top bands.',
            },
          ],
        },
      ],
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      capacity: 5,
      organizer: organizer2.id,
      tenant: tenant2.id,
    },
  })

  const event4 = await payload.create({
    collection: 'events',
    data: {
      title: 'Jazz Festival',
      description: [
        {
          children: [
            {
              text: 'A celebration of jazz music with renowned artists.',
            },
          ],
        },
      ],
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
      capacity: 3,
      organizer: organizer2.id,
      tenant: tenant2.id,
    },
  })

  // Create bookings for tenant 1 events
  // Event 1 - 5 confirmed bookings (full capacity)
  for (let i = 0; i < 5; i++) {
    await payload.create({
      collection: 'bookings',
      data: {
        event: event1.id,
        user: attendees1[i].id,
        status: 'confirmed',
        tenant: tenant1.id,
      },
    })
  }

  // Event 1 - 3 waitlisted bookings
  for (let i = 5; i < 8; i++) {
    await payload.create({
      collection: 'bookings',
      data: {
        event: event1.id,
        user: attendees1[i].id,
        status: 'waitlisted',
        tenant: tenant1.id,
      },
    })
  }

  // Event 2 - 2 confirmed bookings
  for (let i = 8; i < 10; i++) {
    await payload.create({
      collection: 'bookings',
      data: {
        event: event2.id,
        user: attendees1[i].id,
        status: 'confirmed',
        tenant: tenant1.id,
      },
    })
  }

  // Create bookings for tenant 2 events
  // Event 3 - 4 confirmed bookings
  for (let i = 0; i < 4; i++) {
    await payload.create({
      collection: 'bookings',
      data: {
        event: event3.id,
        user: attendees2[i].id,
        status: 'confirmed',
        tenant: tenant2.id,
      },
    })
  }

  // Event 4 - 3 confirmed bookings (full capacity)
  for (let i = 4; i < 7; i++) {
    await payload.create({
      collection: 'bookings',
      data: {
        event: event4.id,
        user: attendees2[i].id,
        status: 'confirmed',
        tenant: tenant2.id,
      },
    })
  }

  // Event 4 - 2 waitlisted bookings
  for (let i = 7; i < 9; i++) {
    await payload.create({
      collection: 'bookings',
      data: {
        event: event4.id,
        user: attendees2[i].id,
        status: 'waitlisted',
        tenant: tenant2.id,
      },
    })
  }

  console.log('Seed completed successfully!')
}

// Self-executing function to run the seed
;(async () => {
  try {
    console.log('Starting seed process...')
    const payload = await getPayload()
    await seed(payload)
    console.log('Seed process completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error during seed process:', error)
    process.exit(1)
  }
})()