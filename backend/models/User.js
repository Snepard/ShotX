const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // The user's unique Ethereum wallet address, serves as the primary key
    walletAddress: {
        type: String,
        required: [true, 'Wallet address is required.'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // Improves query performance for this field
    },
    // A customizable username, can be null initially
    username: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple nulls, but ensures any set username is unique
        default: null,
    },
    // Profile picture details managed by Cloudinary
    profilePic: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
            default: 'https://via.placeholder.com/150/00FFFF/020617?text=ShotX', // A default image
        }
    },
    // The player's on-chain ShotX coin balance (can be synced periodically)
    shotxBalance: {
        type: String,
        default: '0',
    },
    // The highest score achieved by the player in a single game session
    highestScore: {
        type: Number,
        default: 0,
    },
     // The off-chain score accumulated by the player, ready for conversion
    accumulatedScore: {
        type: Number,
        default: 0,
    },
    // An array of strings to identify owned NFTs (e.g., skin IDs)
    ownedNFTs: [{
        type: String,
    }],
}, { 
    // Automatically adds `createdAt` and `updatedAt` fields for record-keeping
    timestamps: true 
});

module.exports = mongoose.model('User', UserSchema);