import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'capacity', 'organizer'],
  },
  access: {
    read: ({ req }) => {
      // Users can only see events in their tenant
      if (req.user) {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }
      return false
    },
    create: ({ req }) => {
      // Only organizers and admins can create events
      if (req.user?.role === 'organizer' || req.user?.role === 'admin') {
        return true
      }
      return false
    },
    update: ({ req }) => {
      // Admins can update any event in their tenant
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Organizers can only update their own events
      if (req.user?.role === 'organizer') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          and: [
            {
              tenant: {
                equals: tenantId,
              },
            },
            {
              organizer: {
                equals: req.user.id,
              },
            },
          ],
        }
      }

      return false
    },
    delete: ({ req }) => {
      // Admins can delete any event in their tenant
      if (req.user?.role === 'admin') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Organizers can only delete their own events
      if (req.user?.role === 'organizer') {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          and: [
            {
              tenant: {
                equals: tenantId,
              },
            },
            {
              organizer: {
                equals: req.user.id,
              },
            },
          ],
        }
      }

      return false
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'capacity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      filterOptions: ({ req }) => {
        // Only show organizers and admins from the same tenant
        if (!req.user?.tenant) return { tenant: { equals: null } }
        
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          and: [
            {
              tenant: {
                equals: tenantId,
              },
            },
            {
              or: [
                {
                  role: {
                    equals: 'organizer',
                  },
                },
                {
                  role: {
                    equals: 'admin',
                  },
                },
              ],
            },
          ],
        }
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
    beforeValidate: [
      ({ req, data }) => {
        // Ensure events are created within the user's tenant
        if (req.user?.tenant) {
          const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
          return {
            ...data,
            tenant: tenantId,
          }
        }
        return data
      },
    ],
    beforeChange: [
      ({ req, data }) => {
        // Double-ensure tenant is set
        if (req.user?.tenant) {
          const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
          return {
            ...data,
            tenant: tenantId,
          }
        }
        return data
      },
    ],
  },
}