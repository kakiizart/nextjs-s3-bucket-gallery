module.exports = {
  apps: [
    {
      // Just a label for PM2
      name: 's3-gallery',

      // ABSOLUTE path to your Next.js app on the VM
      cwd: '/home/ubuntu/s3-bucket-gallery-next',

      // How to start Next in production
      script: 'node_modules/.bin/next',
      args: 'start -H 0.0.0.0 -p 5003',

      // Environment variables for the app
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://next-gallery.kimkakiiza.online',
      },

      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
    },
  ],
};
