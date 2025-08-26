import { PayloadRequest } from 'payload/types'
import { Response, NextFunction } from 'express'

const bookEvent = async (req: PayloadRequest, res: Response, next: NextFunction) => {
  try {
    console.log('=== BOOK EVENT ENDPOINT CALLED ===')
    console.log('Request body:', req.body)
    console.log('User:', req.user ? { id: req.user.id, role: req.user.role, tenant: req.user.tenant } : 'No user')
    
    // Check if user is authenticated
    if (!req.user) {
      console.log('Authentication failed: No user found')
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const { eventId } = req.body
    console.log('Event ID from request:', eventId)

    if (!eventId) {
      console.log('Validation failed: No event ID provided')
      return res.status(400).json({
        message: 'Event ID is required',
      })
    }

    // Get the event
    const event = await req.payload.findByID({
      collection: 'events',
      id: eventId,
    })

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      })
    }

    // Check if event belongs to user's tenant
    const userTenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
    const eventTenantId = typeof event.tenant === 'object' ? event.tenant.id : event.tenant

    if (eventTenantId !== userTenantId) {
      return res.status(403).json({
        message: 'Access denied',
      })
    }

    // Check if user already has a booking for this event
    const existingBooking = await req.payload.find({
      collection: 'bookings',
      where: {
        and: [
          {
            event: {
              equals: eventId,
            },
          },
          {
            user: {
              equals: req.user.id,
            },
          },
          {
            status: {
              not_equals: 'canceled',
            },
          },
        ],
      },
    })

    if (existingBooking.docs.length > 0) {
      return res.status(400).json({
        message: 'You already have a booking for this event',
      })
    }

    // Count confirmed bookings for the event
    const confirmedBookings = await req.payload.find({
      collection: 'bookings',
      where: {
        and: [
          {
            event: {
              equals: eventId,
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

    // Determine booking status based on capacity
    const status = confirmedCount < event.capacity ? 'confirmed' : 'waitlisted'

    // Create the booking
    const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
    console.log('Tenant ID for booking:', tenantId)
    console.log('Tenant type:', typeof req.user.tenant)
    console.log('Raw tenant value:', req.user.tenant)
    
    // Ensure tenant ID is valid before creating booking
    if (!tenantId) {
      console.log('ERROR: Invalid tenant ID')
      return res.status(400).json({
        message: 'Invalid tenant information',
      })
    }
    
    console.log('Creating booking with data:', {
      event: eventId,
      user: req.user.id,
      status,
      tenant: tenantId,
    })
    
    try {
      const booking = await req.payload.create({
        collection: 'bookings',
        data: {
          event: eventId,
          user: req.user.id,
          status,
          tenant: tenantId,
        },
      })
      console.log('Booking created successfully:', booking.id)
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }

    // The hooks in the Bookings collection will handle creating notifications and logs

    return res.status(201).json({
      message: status === 'confirmed' ? 'Booking confirmed' : 'Added to waitlist',
      booking,
    })
  } catch (error) {
    console.error('Error booking event:', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export default bookEvent
