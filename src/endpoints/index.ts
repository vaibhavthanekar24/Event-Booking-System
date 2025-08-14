import { Endpoint } from 'payload/config'
import bookEvent from './bookEvent'
import cancelBooking from './cancelBooking'
import myBookings from './myBookings'
import myNotifications from './myNotifications'
import markNotificationAsRead from './markNotificationAsRead'
import dashboard from './dashboard'

export const endpoints: Endpoint[] = [
  {
    path: '/book-event',
    method: 'post',
    handler: bookEvent,
  },
  {
    path: '/cancel-booking',
    method: 'post',
    handler: cancelBooking,
  },
  {
    path: '/my-bookings',
    method: 'get',
    handler: myBookings,
  },
  {
    path: '/my-notifications',
    method: 'get',
    handler: myNotifications,
  },
  {
    path: '/notifications/:id/read',
    method: 'post',
    handler: markNotificationAsRead,
  },
  {
    path: '/dashboard',
    method: 'get',
    handler: dashboard,
  },
]