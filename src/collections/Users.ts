import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
  },
  auth: true,
  access: {
    read: ({ req }) => {
      // Admin can read all users in their tenant
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Organizers can read all users in their tenant
      if (req.user?.role === 'organizer') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Attendees can only read themselves
      return {
        id: {
          equals: req.user?.id,
        },
      }
    },
    create: ({ req }) => {
      // Only admins can create users
      if (req.user?.role === 'admin') {
        return true
      }
      return false
    },
    update: ({ req, id }) => {
      // Admin can update any user in their tenant
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Users can update themselves
      return {
        id: {
          equals: req.user?.id,
        },
      }
    },
    delete: ({ req }) => {
      // Only admins can delete users in their tenant
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
      name: 'name',
      type: 'text',
      required: true,
    },
    // Email added by default through auth
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Attendee',
          value: 'attendee',
        },
        {
          label: 'Organizer',
          value: 'organizer',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
      ],
      defaultValue: 'attendee',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      hasMany: false,
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Ensure users can only be created within the admin's tenant
        if (req.user?.role === 'admin' && req.user?.tenant) {
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
