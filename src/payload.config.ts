// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { Events } from './collections/Events'
import { Bookings } from './collections/Bookings'
import { Notifications } from './collections/Notifications'
import { BookingLogs } from './collections/BookingLogs'
import { endpoints } from './endpoints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      routes: [
        {
          path: '/dashboard',
          Component: () => import('./admin/Dashboard'),
        },
      ],
      beforeNavLinks: [
        {
          label: 'Dashboard',
          path: '/dashboard',
        },
      ],
    },
  },
  collections: [Tenants, Users, Events, Bookings, Notifications, BookingLogs, Media],
  endpoints,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    connectOptions: {
      retryWrites: true,
      w: 'majority',
      // Removed deprecated options: useNewUrlParser and useUnifiedTopology
      // These have no effect in MongoDB Driver 4.0.0+
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
