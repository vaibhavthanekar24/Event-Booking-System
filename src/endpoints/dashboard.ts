import { PayloadRequest } from 'payload/types'
import { Response, NextFunction } from 'express'

const dashboard = async (req: PayloadRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    // Check if user is an organizer or admin
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Only organizers and admins can access the dashboard.',
      })
    }

    const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant

    // Get upcoming events for the tenant
    const now = new Date()
    const events = await req.payload.find({
      collection: 'events',
      where: {
        and: [
          {
            tenant: {
              equals: tenantId,
            },
          },
          {
            date: {
              greater_than_equal: now.toISOString(),
            },
          },
        ],
      },
      sort: 'date', // Sort by date ascending
    })

    // For each event, get booking counts
    const upcomingEvents = await Promise.all(
      events.docs.map(async (event) => {
        // Get confirmed bookings count
        const confirmedBookings = await req.payload.find({
          collection: 'bookings',
          where: {
            and: [
              {
                event: {
                  equals: event.id,
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

        // Get waitlisted bookings count
        const waitlistedBookings = await req.payload.find({
          collection: 'bookings',
          where: {
            and: [
              {
                event: {
                  equals: event.id,
                },
              },
              {
                status: {
                  equals: 'waitlisted',
                },
              },
            ],
          },
        })

        // Get canceled bookings count
        const canceledBookings = await req.payload.find({
          collection: 'bookings',
          where: {
            and: [
              {
                event: {
                  equals: event.id,
                },
              },
              {
                status: {
                  equals: 'canceled',
                },
              },
            ],
          },
        })

        const confirmedCount = confirmedBookings.totalDocs
        const waitlistedCount = waitlistedBookings.totalDocs
        const canceledCount = canceledBookings.totalDocs

        // Calculate percentage filled
        const percentageFilled = (confirmedCount / event.capacity) * 100

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          capacity: event.capacity,
          confirmedCount,
          waitlistedCount,
          canceledCount,
          percentageFilled,
        }
      })
    )

    // Get summary analytics
    // Total events
    const totalEvents = await req.payload.find({
      collection: 'events',
      where: {
        tenant: {
          equals: tenantId,
        },
      },
      limit: 0, // Just get the count
    })

    // Total confirmed bookings
    const totalConfirmedBookings = await req.payload.find({
      collection: 'bookings',
      where: {
        and: [
          {
            tenant: {
              equals: tenantId,
            },
          },
          {
            status: {
              equals: 'confirmed',
            },
          },
        ],
      },
      limit: 0,
    })

    // Total waitlisted bookings
    const totalWaitlistedBookings = await req.payload.find({
      collection: 'bookings',
      where: {
        and: [
          {
            tenant: {
              equals: tenantId,
            },
          },
          {
            status: {
              equals: 'waitlisted',
            },
          },
        ],
      },
      limit: 0,
    })

    // Total canceled bookings
    const totalCanceledBookings = await req.payload.find({
      collection: 'bookings',
      where: {
        and: [
          {
            tenant: {
              equals: tenantId,
            },
          },
          {
            status: {
              equals: 'canceled',
            },
          },
        ],
      },
      limit: 0,
    })

    // Get recent activity (last 5 booking logs)
    const recentActivity = await req.payload.find({
      collection: 'bookingLogs',
      where: {
        tenant: {
          equals: tenantId,
        },
      },
      sort: '-createdAt',
      limit: 5,
      depth: 2, // Include related data
    })

    return res.status(200).json({
      upcomingEvents,
      summaryAnalytics: {
        totalEvents: totalEvents.totalDocs,
        totalConfirmedBookings: totalConfirmedBookings.totalDocs,
        totalWaitlistedBookings: totalWaitlistedBookings.totalDocs,
        totalCanceledBookings: totalCanceledBookings.totalDocs,
      },
      recentActivity: recentActivity.docs,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export default dashboard