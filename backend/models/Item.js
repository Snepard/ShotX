const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    tokenId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String,
        required: true // This will be the Cloudinary URL
    },
    metadataUrl: {
        type: String,
        required: true // This will be the IPFS URL from Pinata
    },
    isUnique: {
        type: Boolean,
        default: false
    },
    // This field is ONLY populated if isUnique is true.
    currentOwnerAddress: {
        type: String,
        lowercase: true,
        trim: true
    },
    price: { type: Number, required: true, default: 0 }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
