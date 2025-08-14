import type { CollectionConfig } from 'payload'

export const BookingLogs: CollectionConfig = {
  slug: 'bookingLogs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'booking', 'event', 'user', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false

      const tenantId = typeof req.user.tenant === 'string' ? req.user.tenant : req.user.tenant?.id
      if (!tenantId) return false

      // Admins and organizers can read all logs in their tenant
      if (req.user.role === 'admin' || req.user.role === 'organizer') {
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Attendees can only read logs related to their bookings within their tenant
      return {
        tenant: {
          equals: tenantId,
        },
        user: {
          equals: req.user.id,
        },
      }
    },
    create: () => false, // Only system can create logs through hooks
    update: () => false, // Logs cannot be updated
    delete: ({ req }) => {
      // Only admins can delete logs within their tenant
      if (!req.user || req.user.role !== 'admin') return false

      const tenantId = typeof req.user.tenant === 'string' ? req.user.tenant : req.user.tenant?.id
      if (!tenantId) return false

      return {
        tenant: {
          equals: tenantId,
        },
      }
    },
  },
  fields: [
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      required: true,
      hasMany: false,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      hasMany: false,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Create Request',
          value: 'create_request',
        },
        {
          label: 'Auto Waitlist',
          value: 'auto_waitlist',
        },
        {
          label: 'Auto Confirm',
          value: 'auto_confirm',
        },
        {
          label: 'Promote from Waitlist',
          value: 'promote_from_waitlist',
        },
        {
          label: 'Cancel Confirmed',
          value: 'cancel_confirmed',
        },
      ],
    },
    {
      name: 'note',
      type: 'text',
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
      ({ req, data }) => {
        // Ensure logs are created within the user's tenant
        if (req.user?.tenant) {
          const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
          return {
            ...data,
            tenant: data.tenant || tenantId,
          }
        }
        return data
      },
    ],
  },
}