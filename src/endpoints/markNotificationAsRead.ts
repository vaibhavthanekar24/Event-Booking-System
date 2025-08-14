import { PayloadRequest } from 'payload/types'
import { Response, NextFunction } from 'express'

const markNotificationAsRead = async (req: PayloadRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        message: 'Notification ID is required',
      })
    }

    // Get the notification
    const notification = await req.payload.findByID({
      collection: 'notifications',
      id,
    })

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      })
    }

    // Check if notification belongs to user's tenant
    const userTenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
    const notificationTenantId = typeof notification.tenant === 'object' ? notification.tenant.id : notification.tenant
    
    if (notificationTenantId !== userTenantId) {
      return res.status(403).json({
        message: 'Access denied',
      })
    }

    // Check if notification belongs to the user
    if (notification.user !== req.user.id) {
      return res.status(403).json({
        message: 'You are not authorized to mark this notification as read',
      })
    }

    // Update notification to mark as read
    const updatedNotification = await req.payload.update({
      collection: 'notifications',
      id,
      data: {
        read: true,
      },
    })

    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updatedNotification,
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export default markNotificationAsRead