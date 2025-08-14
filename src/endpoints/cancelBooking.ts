import { PayloadRequest } from 'payload/types'
import { Response, NextFunction } from 'express'

const cancelBooking = async (req: PayloadRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const { bookingId } = req.body

    if (!bookingId) {
      return res.status(400).json({
        message: 'Booking ID is required',
      })
    }

    // Get the booking
    const booking = await req.payload.findByID({
      collection: 'bookings',
      id: bookingId,
    })

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      })
    }

    // Check if booking belongs to user's tenant
    const userTenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
    const bookingTenantId = typeof booking.tenant === 'object' ? booking.tenant.id : booking.tenant
    
    if (bookingTenantId !== userTenantId) {
      return res.status(403).json({
        message: 'Access denied',
      })
    }

    // Check if user is authorized to cancel this booking
    if (
      req.user.role === 'attendee' &&
      booking.user !== req.user.id
    ) {
      return res.status(403).json({
        message: 'You are not authorized to cancel this booking',
      })
    }

    // Check if booking is already canceled
    if (booking.status === 'canceled') {
      return res.status(400).json({
        message: 'Booking is already canceled',
      })
    }

    // Update booking status to canceled
    const updatedBooking = await req.payload.update({
      collection: 'bookings',
      id: bookingId,
      data: {
        status: 'canceled',
      },
    })

    // The hooks in the Bookings collection will handle creating notifications, logs,
    // and promoting waitlisted bookings

    return res.status(200).json({
      message: 'Booking canceled successfully',
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Error canceling booking:', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export default cancelBooking