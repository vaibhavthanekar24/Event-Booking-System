module.exports = {
  // Specify the regions where your code should be deployed
  regions: ['iad1'],

  // Configure the build output directory
  outputDirectory: '.next',

  // Configure build environment variables
  build: {
    env: {
      PAYLOAD_SECRET: '3b59baf6902a880d643ee5d9',
      DATABASE_URI:
        'mongodb+srv://vaibhavthanekar007_db_user:2Y8dXxMwC9Sy07np@clusterforpayloadcms.oruemqm.mongodb.net/',
      NEXT_PUBLIC_SERVER_URL: '@next_public_server_url',
    },
  },
}
