const cloudinary = require('cloudinary').v2;

/**
 * Configures the Cloudinary SDK with credentials from environment variables.
 */
const configureCloudinary = () => {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        // A salient check to ensure environment variables are loaded
        if (!cloudName || !apiKey || !apiSecret) {
            console.warn("⚠️  Cloudinary environment variables are not fully set. File uploads will be disabled.");
            return;
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });

        console.log("✅ Cloudinary configuration successful.");

    } catch (error) { // MODIFIED: Added the opening curly brace for the catch block
        console.error("❌ Failed to configure Cloudinary:", error);
    }
};

// Export the function directly as the module's main export.
module.exports = configureCloudinary;

