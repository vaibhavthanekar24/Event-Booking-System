module.exports = {
  // Specify the regions where your code should be deployed
  regions: ['iad1'],
  
  // Configure the build output directory
  outputDirectory: '.next',
  
  // Configure build environment variables
  build: {
    env: {
      PAYLOAD_SECRET: '@payload_secret',
      DATABASE_URI: '@database_uri',
      NEXT_PUBLIC_SERVER_URL: '@next_public_server_url'
    }
  }
}