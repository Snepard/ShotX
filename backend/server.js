// --- Core & Utility Imports ---
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const { uploader } = require('cloudinary').v2;

// --- Local Module Imports ---
const { ethers } = require('ethers');
const contractABI = require('./config/contractABI');
const User = require('./models/User');
// MODIFIED: This line is the critical fix. It imports the function directly.
const configureCloudinary = require('./config/cloudinary');
const configureMulter = require('./config/multer');

// --- INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 5001;
// This line will now work correctly.
configureCloudinary();

// --- MIDDLEWARE ---
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- DATABASE CONNECTION ---
console.log("Attempting to connect to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connection established successfully."))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- BLOCKCHAIN SETUP ---
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.BACKEND_WALLET_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
console.log(`✅ Backend server wallet address: ${wallet.address}`);

// --- JWT Secret ---
const JWT_SECRET = process.env.JWT_SECRET;


// =================================================================
// --- AUTHENTICATION & USER CREATION ENDPOINTS ---
// =================================================================

app.get('/auth/message', (req, res) => {
  console.log("LOG: Received request for auth message.");
  res.json({ message: `Welcome to ShotX! Sign this message to log in. Nonce: ${Date.now()}` });
});

app.post('/auth/login', async (req, res) => {
    console.log("1. Received /auth/login request.");
    const { address, signature, message } = req.body;
    if (!address || !signature || !message) {
        console.error("FATAL ERROR: Login request is missing address, signature, or message.");
        return res.status(400).send("Missing login credentials.");
    }
    console.log(`2. Attempting to verify signature for address: ${address}`);

    try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        console.log(`3. Signature recovered address: ${recoveredAddress}`);

        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
            console.log("4. ✅ Signature VERIFIED. Checking database...");
            const lowerCaseAddress = address.toLowerCase();
            let user = await User.findOne({ walletAddress: lowerCaseAddress });

            if (!user) {
                console.log(`5. User not found. Creating new user in DB...`);
                user = new User({ walletAddress: lowerCaseAddress });
                await user.save();
                console.log(`6. ✅ New user CREATED for address: ${lowerCaseAddress}`);
            } else {
                console.log(`5. ✅ User FOUND in database.`);
            }

            const token = jwt.sign({ address: lowerCaseAddress }, JWT_SECRET, { expiresIn: '1h' });
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000,
            });
            console.log("7. ✅ JWT cookie set. Sending success response.");
            res.status(200).json({ message: "Logged in successfully", user });
        } else {
            console.error("FATAL ERROR: Signature verification failed. Recovered address does not match.");
            res.status(401).send("Invalid signature");
        }
    } catch (error) {
        console.error("FATAL ERROR: An error occurred during the login process:", error);
        res.status(500).send("Error during login");
    }
});

app.get('/auth/verify', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ loggedIn: false });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ loggedIn: true, address: decoded.address });
  } catch (err) {
    res.status(401).json({ loggedIn: false });
  }
});

app.post('/auth/logout', (req, res) => {
  console.log("LOG: Received request to log out.");
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: "Logged out successfully." });
});

// =================================================================
// --- GAME & PLAYER DATA ENDPOINTS ---
// =================================================================

app.get('/api/user/:walletAddress', async (req, res) => {
    try {
        const address = req.params.walletAddress.toLowerCase();
        const user = await User.findOne({ walletAddress: address });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please log in first.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
});

const upload = configureMulter();
app.put('/api/user/:walletAddress/profile', upload.single('profilePic'), async (req, res) => {
    try {
        const { username } = req.body;
        const address = req.params.walletAddress.toLowerCase();
        const user = await User.findOne({ walletAddress: address });

        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        if (username) user.username = username;

        if (req.file) {
            if (user.profilePic && user.profilePic.public_id) {
                await uploader.destroy(user.profilePic.public_id);
            }
            const result = await uploader.upload(req.file.path, { folder: "shotx_profiles" });
            user.profilePic = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
});

app.post('/api/score/update', async (req, res) => {
  const { walletAddress, newScore } = req.body;
  const lowerCaseAddress = walletAddress.toLowerCase();

  try {
    const user = await User.findOneAndUpdate(
        { walletAddress: lowerCaseAddress },
        { 
            $inc: { accumulatedScore: newScore },
            $max: { highestScore: newScore }
        },
        { new: true, upsert: false } // `new: true` returns the updated doc
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "Score updated successfully", data: user });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ message: 'Server error while updating score.' });
  }
});

app.post('/api/score/convert', async (req, res) => {
  const { walletAddress } = req.body;
  const lowerCaseAddress = walletAddress.toLowerCase();

  try {
    const user = await User.findOne({ walletAddress: lowerCaseAddress });
    if (!user || user.accumulatedScore <= 0) {
      return res.status(400).json({ message: "No score to convert." });
    }
    
    const scoreToConvert = user.accumulatedScore;
    const coinsToMint = Math.floor(scoreToConvert / 10);
    
    if (coinsToMint <= 0) {
      return res.status(400).json({ message: "Not enough score to convert." });
    }
    
    const amountToMint = ethers.parseUnits(coinsToMint.toString(), 18);
    console.log(`Attempting to mint ${coinsToMint} SXC for ${lowerCaseAddress}`);
    
    const tx = await contract.awardCoins(lowerCaseAddress, amountToMint);
    await tx.wait();
    
    console.log(`Transaction confirmed! Minted ${coinsToMint} SXC.`);
    user.accumulatedScore = 0;
    await user.save();
    
    res.status(200).json({ message: `Successfully converted score and minted ${coinsToMint} SXC!`, txHash: tx.hash });
  } catch (error) {
    console.error("Blockchain transaction failed:", error);
    res.status(500).json({ message: "Failed to mint coins due to a network error." });
  }
});


// --- SERVER LISTENING ---
app.listen(PORT, () => {
  console.log(`🚀 ShotX backend server is running with celerity on http://localhost:${PORT}`);
});
