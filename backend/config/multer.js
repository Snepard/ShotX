const multer = require('multer');
const path = require('path');

/**
 * Configures Multer for handling multipart/form-data, primarily for image uploads.
 */
const configureMulter = () => {
    return multer({
        // We use disk storage for temporary holding before uploading to Cloudinary
        storage: multer.diskStorage({}), 
        
        // A filter to ensure only valid image file types are accepted
        fileFilter: (req, file, cb) => {
            const allowedExtensions = /jpeg|jpg|png/;
            const isExtensionValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
            const isMimeTypeValid = allowedExtensions.test(file.mimetype);

            if (isExtensionValid && isMimeTypeValid) {
                return cb(null, true);
            } else {
                cb(new Error("File type not supported. Please upload a JPG or PNG image."), false);
            }
        },
        limits: {
            fileSize: 1024 * 1024 * 5 // Set a file size limit (e.g., 5MB)
        }
    });
};

module.exports = configureMulter;
