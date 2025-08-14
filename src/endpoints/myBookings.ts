import { PayloadRequest } from 'payload/types'
import { Response, NextFunction } from 'express'

const myBookings = async (req: PayloadRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    // Get all bookings for the current user
    const bookings = await req.payload.find({
      collection: 'bookings',
      where: {
        and: [
          {
            user: {
              equals: req.user.id,
            },
          },
          {
            tenant: {
              equals: typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant,
            },
          },
        ],
      },
      depth: 2, // Include related event details
    })

    return res.status(200).json({
      bookings: bookings.docs,
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export default myBookings