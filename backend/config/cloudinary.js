const cloudinary = require('cloudinary').v2;

// This is the crucial step that configures the SDK with your credentials.
// It uses the environment variables you have already set up.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Ensures all URLs are served over HTTPS
});

// A quick check to confirm the configuration was successful upon server start.
if (cloudinary.config().cloud_name) {
    console.log('✅ Cloudinary configuration successful.');
} else {
    console.error('❌ Cloudinary configuration failed. Check your .env variables.');
}

// We export the configured object directly for use in other parts of the application.
module.exports = cloudinary;
