import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'read', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      // Admins can read all notifications in their tenant
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Users can only read their own notifications
      const tenantId = typeof req.user?.tenant === 'object' ? req.user?.tenant.id : req.user?.tenant
      return {
        and: [
          {
            tenant: {
              equals: tenantId,
            },
          },
          {
            user: {
              equals: req.user?.id,
            },
          },
        ],
      }
    },
    create: ({ req }) => {
      // Only system and admins can create notifications
      return req.user?.role === 'admin'
    },
    update: ({ req }) => {
      // Admins can update any notification in their tenant
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Users can only mark their own notifications as read
      const tenantId = typeof req.user?.tenant === 'object' ? req.user?.tenant.id : req.user?.tenant
      return {
        and: [
          {
            tenant: {
              equals: tenantId,
            },
          },
          {
            user: {
              equals: req.user?.id,
            },
          },
        ],
      }
    },
    delete: ({ req }) => {
      // Only admins can delete notifications
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }
      return false
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      required: true,
      hasMany: false,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Booking Confirmed',
          value: 'booking_confirmed',
        },
        {
          label: 'Waitlisted',
          value: 'waitlisted',
        },
        {
          label: 'Waitlist Promoted',
          value: 'waitlist_promoted',
        },
        {
          label: 'Booking Canceled',
          value: 'booking_canceled',
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
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
        // Ensure notifications are created within the user's tenant
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