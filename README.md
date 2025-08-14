# Multi-Tenant Event Booking System

A comprehensive event booking backend built with Payload CMS that supports multiple organizations (tenants) with complete data isolation. The system enforces event capacity limits, automatically manages waitlists, and provides notifications for booking status changes.

## Features

- **Multi-Tenancy**: Complete data isolation between different organizations
- **Event Booking**: Automatic confirmation or waitlisting based on capacity
- **Waitlist Management**: Automatic promotion from waitlist when seats become available
- **Notifications**: In-app notifications for all booking status changes
- **Activity Logging**: Comprehensive logging of all booking actions
- **Organizer Dashboard**: Visual statistics and booking analytics
- **Role-Based Access Control**: Different permissions for attendees, organizers, and admins

## Collections

1. **Tenants**: Organizations that can manage their own events and users
2. **Users**: Users with different roles (attendee, organizer, admin)
3. **Events**: Events with title, description, date, and capacity
4. **Bookings**: Event bookings with status (confirmed, waitlisted, canceled)
5. **Notifications**: In-app notifications for booking status changes
6. **BookingLogs**: Activity logs for all booking actions

## API Endpoints

1. `POST /api/book-event`: Create a new booking
2. `POST /api/cancel-booking`: Cancel an existing booking
3. `GET /api/my-bookings`: Get all bookings for the current user
4. `GET /api/my-notifications`: Get all unread notifications for the current user
5. `POST /api/notifications/:id/read`: Mark a notification as read
6. `GET /api/dashboard`: Get dashboard data for organizers

## Getting Started

### Prerequisites

- Node.js (v18.20.2 or v20.9.0+)
- MongoDB
- pnpm (v9 or v10)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URI` with your MongoDB connection string
   - Update `PAYLOAD_SECRET` with a secure random string

### Development

1. Start the development server:
   ```
   npm run dev
   ```
2. Access the admin panel at `http://localhost:3000/admin`

### Seed Data

To populate the database with test data:

```
node mongodb-direct-seed.js
```

This will create:

- 2 tenants (TechConf Inc. and MusicFest LLC)
- Admin, organizer, and attendee users for each tenant
- Sample events with various booking statuses

### Test Accounts

#### TechConf Inc.

- Admin: admin1@techconf.com / password123
- Organizer: organizer1@techconf.com / password123
- Attendees: attendee1@techconf.com through attendee10@techconf.com / password123

#### MusicFest LLC

- Admin: admin2@musicfest.com / password123
- Organizer: organizer2@musicfest.com / password123
- Attendees: attendee1@musicfest.com through attendee10@musicfest.com / password123

## Booking Flow

1. **Creating a Booking**:
   - If event has capacity: Status = confirmed
   - If event is full: Status = waitlisted

2. **Canceling a Booking**:
   - Mark booking as canceled
   - Promote oldest waitlisted booking to confirmed

3. **Notifications**:
   - Generated for all status changes
   - Users can mark notifications as read

## Dashboard

The organizer dashboard provides:

1. **Upcoming Events**: List of events with booking counts
2. **Capacity Visualization**: Circular progress indicators for each event
3. **Summary Analytics**: Total events and booking statistics
4. **Recent Activity**: Latest booking actions

## Access Rules

- **Attendees**: Can only book for themselves and view their own data
- **Organizers**: Can manage events and see all bookings for their tenant
- **Admins**: Full access for their tenant

Cross-tenant access is strictly forbidden and enforced at the backend level.
