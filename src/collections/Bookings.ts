import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['event', 'user', 'status', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      // Admins can read all bookings in their tenant
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Organizers can read all bookings for events in their tenant
      if (req.user?.role === 'organizer') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Attendees can only read their own bookings
      if (req.user?.role === 'attendee') {
        return {
          user: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    create: ({ req }) => {
      // All authenticated users can create bookings
      return Boolean(req.user)
    },
    update: ({ req }) => {
      // Admins can update any booking in their tenant
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Organizers can update any booking in their tenant
      if (req.user?.role === 'organizer') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Attendees can only update their own bookings
      if (req.user?.role === 'attendee') {
        return {
          user: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    delete: ({ req }) => {
      // Admins can delete any booking in their tenant
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Organizers can delete any booking in their tenant
      if (req.user?.role === 'organizer') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Attendees can only delete their own bookings
      if (req.user?.role === 'attendee') {
        return {
          user: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      hasMany: false,
      filterOptions: ({ req }) => {
        // Only show events from the same tenant
        if (!req.user?.tenant) return { tenant: { equals: null } }

        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      filterOptions: ({ req }) => {
        // Only show users from the same tenant
        if (!req.user?.tenant) return { tenant: { equals: null } }

        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Confirmed',
          value: 'confirmed',
        },
        {
          label: 'Waitlisted',
          value: 'waitlisted',
        },
        {
          label: 'Canceled',
          value: 'canceled',
        },
      ],
      defaultValue: 'confirmed',
    },
    {
      name: 'createdAt',
      type: 'date',
      hooks: {
        beforeChange: [
          () => {
            return new Date()
          },
        ],
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      hasMany: false,
      filterOptions: ({ req }) => {
        // Only show tenant that the user belongs to
        if (!req.user?.tenant) return { id: { equals: null } }

        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          id: {
            equals: tenantId,
          },
        }
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // Ensure bookings are created within the user's tenant
        if (req.user?.tenant) {
          const tenantId =
            typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
          data.tenant = tenantId
        }

        // If this is a new booking, determine if it should be confirmed or waitlisted
        if (operation === 'create') {
          // Set the user to the current user if not specified (for attendees)
          if (req.user?.role === 'attendee' && !data.user) {
            data.user = req.user.id
          }

          // Get the event to check capacity
          const { payload } = req
          const event = await payload.findByID({
            collection: 'events',
            id: data.event,
          })

          // Count confirmed bookings for this event
          const confirmedBookings = await payload.find({
            collection: 'bookings',
            where: {
              and: [
                {
                  event: {
                    equals: data.event,
                  },
                },
                {
                  status: {
                    equals: 'confirmed',
                  },
                },
              ],
            },
          })

          const confirmedCount = confirmedBookings.totalDocs

          // If event is full, set status to waitlisted
          if (confirmedCount >= event.capacity) {
            data.status = 'waitlisted'
          } else {
            data.status = 'confirmed'
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ req, doc, operation, previousDoc }) => {
        const { payload } = req

        console.log('=== BOOKING AFTER CHANGE HOOK ===')
        console.log('Operation:', operation)
        console.log('Document ID:', doc.id)
        console.log('Document tenant:', doc.tenant)
        console.log('Document tenant type:', typeof doc.tenant)

        // Create notification and booking log
        if (operation === 'create') {
          console.log('Creating notification and booking log for new booking')
          // Create notification based on status
          let notificationType = ''
          let notificationTitle = ''
          let notificationMessage = ''
          let logAction = ''
          let logNote = ''

          // Get event details
          const event = await payload.findByID({
            collection: 'events',
            id: doc.event,
          })
          console.log('Event details:', event)
          console.log('doc.status:', doc.status)
          if (doc.status === 'confirmed') {
            notificationType = 'booking_confirmed'
            notificationTitle = 'Booking Confirmed'
            notificationMessage = `Your booking for ${event.title} has been confirmed.`
            logAction = 'auto_confirm'
            logNote = 'Booking was automatically confirmed due to available capacity.'
          } else if (doc.status === 'waitlisted') {
            notificationType = 'waitlisted'
            notificationTitle = 'Added to Waitlist'
            notificationMessage = `You have been added to the waitlist for ${event.title}.`
            logAction = 'auto_waitlist'
            logNote = 'Booking was automatically waitlisted due to event being at capacity.'
          }

          // Get valid tenant ID
          const tenantId = typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant
          console.log('Tenant ID for notification:', tenantId)
          console.log('Original tenant value:', doc.tenant)

          // Create notification
          console.log('Creating notification with data:', {
            user: doc.user,
            booking: doc.id,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            tenant: tenantId,
          })

          try {
            await payload.create({
              collection: 'notifications',
              data: {
                user: doc.user,
                booking: doc.id,
                type: notificationType,
                title: notificationTitle,
                message: notificationMessage,
                read: false,
                tenant: tenantId,
              },
              req, // Pass the original req for validation context
              overrideAccess: true, // Bypass if needed (assuming similar restrictions)
            })
            console.log('Notification created successfully')
          } catch (error) {
            console.error('Error creating notification:', error)
          }

          // Create booking log
          await payload.create({
            collection: 'bookingLogs',
            data: {
              booking: doc.id,
              event: doc.event,
              user: doc.user,
              action: logAction,
              note: logNote,
              tenant: tenantId, // Use the same valid tenant ID
            },
            req, // Pass the original req for validation context
            overrideAccess: true, // Bypass if needed (assuming similar restrictions)
          })
        }

        // Handle status changes for existing bookings
        if (operation === 'update' && previousDoc.status !== doc.status) {
          console.log('Operation:', operation)
          // Get event details
          const event = await payload.findByID({
            collection: 'events',
            id: doc.event,
          })

          // Handle cancellation and promote from waitlist
          if (previousDoc.status === 'confirmed' && doc.status === 'canceled') {
            // Get valid tenant ID
            const tenantId = typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant

            // Create notification for cancellation
            await payload.create({
              collection: 'notifications',
              data: {
                user: doc.user,
                booking: doc.id,
                type: 'booking_canceled',
                title: 'Booking Canceled',
                message: `Your booking for ${event.title} has been canceled.`,
                read: false,
                tenant: tenantId,
              },
              req, // Pass the original req for validation context
              overrideAccess: true, // Bypass if needed (assuming similar restrictions)
            })

            // Create booking log for cancellation
            await payload.create({
              collection: 'bookingLogs',
              data: {
                booking: doc.id,
                event: doc.event,
                user: doc.user,
                action: 'cancel_confirmed',
                note: 'Confirmed booking was canceled.',
                tenant: tenantId,
              },
              req, // Pass the original req for validation context
              overrideAccess: true, // Bypass if needed (assuming similar restrictions)
            })

            // Find oldest waitlisted booking for this event
            const waitlistedBookings = await payload.find({
              collection: 'bookings',
              where: {
                and: [
                  {
                    event: {
                      equals: doc.event,
                    },
                  },
                  {
                    status: {
                      equals: 'waitlisted',
                    },
                  },
                ],
              },
              sort: 'createdAt',
              limit: 1,
            })

            // If there's a waitlisted booking, promote it
            if (waitlistedBookings.docs.length > 0) {
              const bookingToPromote = waitlistedBookings.docs[0]

              // Update the booking status to confirmed
              await payload.update({
                collection: 'bookings',
                id: bookingToPromote.id,
                data: {
                  status: 'confirmed',
                },
              })

              // Create notification for promotion
              await payload.create({
                collection: 'notifications',
                data: {
                  user: bookingToPromote.user,
                  booking: bookingToPromote.id,
                  type: 'waitlist_promoted',
                  title: 'Promoted from Waitlist',
                  message: `Great news! You've been promoted from the waitlist for ${event.title}.`,
                  read: false,
                  tenant: tenantId,
                },
                req, // Pass the original req for validation context
                overrideAccess: true, // Bypass if needed (assuming similar restrictions)
              })

              // Create booking log for promotion
              await payload.create({
                collection: 'bookingLogs',
                data: {
                  booking: bookingToPromote.id,
                  event: doc.event,
                  user: bookingToPromote.user,
                  action: 'promote_from_waitlist',
                  note: 'Booking was promoted from waitlist due to a cancellation.',
                  tenant: tenantId,
                },
                req, // Pass the original req for validation context
                overrideAccess: true, // Bypass if needed (assuming similar restrictions)
              })
            }
          }
        }
      },
    ],
  },
}
