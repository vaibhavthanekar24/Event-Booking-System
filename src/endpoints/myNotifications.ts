import { PayloadRequest } from 'payload/types'
import { Response, NextFunction } from 'express'

const myNotifications = async (req: PayloadRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    // Get all unread notifications for the current user
    const notifications = await req.payload.find({
      collection: 'notifications',
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
          {
            read: {
              equals: false,
            },
          },
        ],
      },
      sort: '-createdAt', // Sort by newest first
    })

    return res.status(200).json({
      notifications: notifications.docs,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export default myNotifications