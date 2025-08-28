import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '../../../payload.config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is an organizer or admin
    if (user.role !== 'organizer' && user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied. Only organizers and admins can access the dashboard.' },
        { status: 403 }
      )
    }

    const tenantId = user.tenant

    // Get upcoming events for the tenant
    const now = new Date()
    const events = await payload.find({
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
        const confirmedBookings = await payload.find({
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
        const waitlistedBookings = await payload.find({
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

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          capacity: event.capacity,
          confirmedBookings: confirmedBookings.totalDocs,
          waitlistedBookings: waitlistedBookings.totalDocs,
          availableSpots: Math.max(0, event.capacity - confirmedBookings.totalDocs),
        }
      })
    )

    // Get total events count
    const totalEvents = await payload.find({
      collection: 'events',
      where: {
        tenant: {
          equals: tenantId,
        },
      },
      limit: 0, // Only get count
    })

    // Get total confirmed bookings count
    const totalConfirmedBookings = await payload.find({
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
      limit: 0, // Only get count
    })

    // Get total waitlisted bookings count
    const totalWaitlistedBookings = await payload.find({
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
      limit: 0, // Only get count
    })

    // Get total canceled bookings count
    const totalCanceledBookings = await payload.find({
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
      limit: 0, // Only get count
    })

    // Get recent activity (bookings and cancellations)
    const recentActivity = await payload.find({
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

    return NextResponse.json({
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
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}