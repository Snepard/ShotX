const Item = require('../models/Item');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const axios = require('axios');
// MODIFIED: Destructure classes directly from ethers
const { JsonRpcProvider, Wallet, Contract } = require('ethers');

// --- IMPORTANT: CONFIGURE THESE ---
const PINATA_JWT = process.env.PINATA_JWT;
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const CONTRACT_ABI = require('../config/nftContractAbi.js');
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY;

// MODIFIED: Instantiate classes directly
const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new Wallet(ADMIN_PRIVATE_KEY, provider);
const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "shotx-items" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

exports.mintItem = async (req, res) => {
    try {
        const { name, description, supply } = req.body;
        const imageFile = req.file;

        if (!name || !supply || !imageFile) {
            return res.status(400).json({ message: "Name, supply, and image are required." });
        }

        // 1. Upload Image to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(imageFile.buffer);

        // 2. Upload Metadata to IPFS via Pinata
        const metadata = {
            name,
            description,
            image: cloudinaryResult.secure_url
        };

        const pinataResponse = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
            headers: { Authorization: `Bearer ${PINATA_JWT}` }
        });
        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`;

        // 3. Mint the Token on the Blockchain
        console.log("Submitting mint transaction to the blockchain...");
        const isUnique = parseInt(supply) === 1;
        const tx = isUnique ? await contract.mintUnique() : await contract.mint(supply);
        
        console.log(`Transaction sent! Hash: ${tx.hash}`);
        const receipt = await tx.wait(); // Wait for transaction to be mined
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        // 4. Extract Token ID from Transaction Events
        let tokenId = null;
        // In ethers v6, events are found in the logs array
        for (const log of receipt.logs) {
            try {
                const parsedLog = contract.interface.parseLog(log);
                if (parsedLog && parsedLog.name === 'TransferSingle') {
                    tokenId = parsedLog.args.id.toString();
                    break;
                }
            } catch (e) {
                // Ignore logs that aren't from this contract's ABI
            }
        }

        if (!tokenId) throw new Error("Could not find TransferSingle event to determine token ID.");
        
        // 5. Save Item to Database
        const newItem = new Item({
            tokenId: parseInt(tokenId),
            name,
            description,
            imageUrl: cloudinaryResult.secure_url,
            metadataUrl,
            isUnique,
            currentOwnerAddress: isUnique ? wallet.address : null
        });
        await newItem.save();

        res.status(201).json({ message: "Item minted and saved successfully!", item: newItem });

    } catch (error) {
        console.error("Minting process failed:", error);
        res.status(500).json({ message: "An egregious error occurred during minting.", error: error.message });
    }
};

