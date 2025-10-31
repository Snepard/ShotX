// backend/controllers/itemController.js

const Item = require('../models/Item');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const axios = require('axios');
// MODIFIED: Destructure classes directly from ethers
const { JsonRpcProvider, Wallet, Contract, ethers } = require('ethers'); // Added ethers

// --- IMPORTANT: CONFIGURE THESE ---
const PINATA_JWT = process.env.PINATA_JWT;

// --- MODIFIED: Load all contract addresses and ABIs ---
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const NFT_CONTRACT_ABI = require('../config/nftContractAbi.js');
const MARKETPLACE_CONTRACT_ADDRESS = process.env.MARKETPLACE_CONTRACT_ADDRESS; // NEW
const MARKETPLACE_ABI = require('../config/marketplaceContractAbi.js'); // NEW

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY;
// --------------------------------------------------

// MODIFIED: Instantiate classes directly
const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new Wallet(ADMIN_PRIVATE_KEY, provider);

// --- MODIFIED: Create instances for both contracts ---
const itemsContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, wallet);
const marketplaceContract = new Contract(MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI, wallet); // NEW
// ----------------------------------------------------

// Controller to get all nft from the database
exports.getAllItems = async (req, res) => {
    try {
        // Fetches all documents from the 'items' collection
        const items = await Item.find({});
        res.status(200).json(items);
    } catch (error) {
        console.error("Failed to fetch items:", error);
        res.status(500).json({ message: "Error retrieving items from the database." });
    }
};

// Helper function to upload buffer to Cloudinary (unchanged)
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
        const { name, description, supply, price } = req.body;
        const imageFile = req.file;
        const numericSupply = parseInt(supply);
        const numericPrice = parseInt(price);

        if (!name || !numericSupply || !imageFile || !numericPrice) {
            return res.status(400).json({ message: "Name, supply, image, and price are required." });
        }

        // 1. Upload Image to Cloudinary (unchanged)
        const cloudinaryResult = await uploadToCloudinary(imageFile.buffer);

        // 2. Upload Metadata to IPFS via Pinata (unchanged)
        const metadata = {
            name,
            description,
            image: cloudinaryResult.secure_url
        };

        const pinataResponse = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
            headers: { Authorization: `Bearer ${PINATA_JWT}` }
        });
        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`;

        // 3. Mint the Token on the Blockchain (unchanged)
        console.log("Submitting mint transaction to the blockchain...");
        const isUnique = numericSupply === 1;
        const tx = isUnique ? await itemsContract.mintUnique() : await itemsContract.mint(numericSupply);
        
        console.log(`Transaction sent! Hash: ${tx.hash}`);
        const receipt = await tx.wait(); // Wait for transaction to be mined
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        // 4. Extract Token ID from Transaction Events (unchanged)
        let tokenId = null;
        for (const log of receipt.logs) {
            try {
                const parsedLog = itemsContract.interface.parseLog(log);
                if (parsedLog && parsedLog.name === 'TransferSingle') {
                    tokenId = parsedLog.args.id.toString();
                    break;
                }
            } catch (e) {
                // Ignore logs that aren't from this contract's ABI
            }
        }

        if (!tokenId) throw new Error("Could not find TransferSingle event to determine token ID.");
        
        console.log(`✅ Token ID ${tokenId} successfully minted to backend wallet.`);

        // --- NEW AUTOMATION STEP 4A: Stock the Marketplace ---
        console.log(`Transferring ${numericSupply} of Token ID ${tokenId} to Marketplace...`);
        const stockTx = await itemsContract.safeTransferFrom(wallet.address, MARKETPLACE_CONTRACT_ADDRESS, tokenId, numericSupply, "0x");
        await stockTx.wait();
        console.log(`✅ Marketplace successfully stocked with Token ID ${tokenId}.`);
        // -----------------------------------------------------

        // --- NEW AUTOMATION STEP 4B: List the Item for Sale ---
        console.log(`Listing Token ID ${tokenId} on the marketplace...`);
        const parsedPrice = ethers.parseUnits(price.toString(), 18);
        const listTx = await marketplaceContract.listItem(tokenId, parsedPrice);
        await listTx.wait();
        console.log(`✅ Token ID ${tokenId} successfully listed for sale at ${price} SXC.`);
        // ------------------------------------------------------
        
        // 5. Save Item to Database (unchanged)
        const newItem = new Item({
            tokenId: parseInt(tokenId),
            name,
            description,
            imageUrl: cloudinaryResult.secure_url,
            metadataUrl,
            isUnique,
            price: numericPrice,
            currentOwnerAddress: isUnique ? wallet.address : null // Note: This is owner *at mint*, not current
        });
        await newItem.save();

        res.status(201).json({ message: "Item minted, stocked, and listed successfully!", item: newItem });

    } catch (error) {
        console.error("Minting process failed:", error);
        res.status(500).json({ message: "An egregious error occurred during minting.", error: error.message });
    }
};