// JavaScript version of payload.config.ts
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { payloadCloudPlugin } from '@payloadcms/payload-cloud';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Import collections
import { Users } from './collections/Users.ts';
import { Media } from './collections/Media.ts';
import { Tenants } from './collections/Tenants.ts';
import { Events } from './collections/Events.ts';
import { Bookings } from './collections/Bookings.ts';
import { Notifications } from './collections/Notifications.ts';
import { BookingLogs } from './collections/BookingLogs.ts';
import { endpoints } from './endpoints/index.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
          Component: () => import('./admin/Dashboard.tsx'),
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
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
  ],
});