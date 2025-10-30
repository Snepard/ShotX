import { ethers } from 'ethers';
import axios from 'axios';

// ABIs - Make sure you've created MarketplaceABI.json
import ShotXTokenABI from '../contracts/ShotXTokenABI.json';
import MarketplaceABI from '../contracts/MarketplaceABI.json';
import ShotXItemsABI from '../contracts/ShotXItemsABI.json';

// --- CONFIGURATION ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Contract Addresses from your .env file or defaults
const SHOTX_CONTRACT_ADDRESS = import.meta.env.VITE_SHOTX_CONTRACT_ADDRESS;
const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;
const SHOTX_ITEMS_ADDRESS = import.meta.env.VITE_SHOTX_ITEMS_ADDRESS;
// --- END CONFIGURATION ---


// ===================================================================================
//  EXISTING AUTH & USER FUNCTIONS (NO CHANGES)
// ===================================================================================

export const verifyExistingLogin = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/verify`, { withCredentials: true });
        if (response.data && response.data.loggedIn) {
            console.log("✅ Existing session verified for address:", response.data.address);
            return response.data.address;
        }
        return null;
    } catch (error) {
        console.log("Verification check failed:", error.message);
        return null;
    }
};

export const loginAndAuthenticate = async () => {
    try {
        console.log("1. Authentication process initiated.");
        if (!window.ethereum) throw new Error("MetaMask is not installed.");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        console.log("2. Signer obtained for address:", address);

        const messageResponse = await axios.get(`${API_URL}/auth/message`);
        const { message } = messageResponse.data;
        if (!message) throw new Error("Could not retrieve message from server.");

        console.log("3. Received message from backend:", message);

        console.log("4. Requesting signature from user...");
        const signature = await signer.signMessage(message);
        console.log("5. Signature received!", signature);
 
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            address,
            signature,
            message,
        }, { withCredentials: true });

        console.log("6. ✅ Login successful! User is authenticated.");
        
        return loginResponse.data.user;

    } catch (error) {
        console.error("❌ Failed to connect wallet and authenticate:", error);
        return null;
    }
};

export const logoutUser = async () => {
    try {
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        console.log("✅ Logged out successfully from backend.");
        return true;
    } catch (error) {
        console.error("❌ Logout failed:", error);
        return false;
    }
};

export const fetchUserProfile = async (walletAddress) => {
    if (!walletAddress) return null;
    try {
        const response = await axios.get(`${API_URL}/api/user/${walletAddress}`);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
        return null;
    }
};

export const updateUserProfile = async (walletAddress, formData) => {
    try {
        const config = { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true };
        const response = await axios.put(`${API_URL}/api/user/${walletAddress}/profile`, formData, config);
        // Only show success alert when user explicitly changes profile credentials
        // i.e., when updating username or profile picture via the edit UI.
        if (typeof formData?.has === 'function' && (formData.has('username') || formData.has('profilePic'))) {
            alert('Profile updated successfully!');
        }
        return response.data;
    } catch (error) {
        console.error("❌ Failed to update user profile:", error);
        alert(`Update failed: ${error.response?.data?.message || 'Server error'}`);
        return null;
    }
};

export const updateScore = async (walletAddress, newScore) => {
    try {
        const response = await axios.post(`${API_URL}/api/score/update`, {
            walletAddress,
            newScore,
        }, { withCredentials: true });
        
        console.log('✅ Score saved:', response.data.message);
        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error("❌ Failed to update score:", errorMsg);
        alert(`Failed to save score: ${errorMsg}`);
        return null;
    }
};

export const convertScoreToCoins = async (walletAddress) => {
    try {
        const response = await axios.post(`${API_URL}/api/score/convert`, { walletAddress });
        console.log("✅ Score conversion successful:", response.data.message);
        alert(response.data.message);
        return response.data;
    } catch (error) {
        console.error("❌ Score conversion failed:", error.response?.data?.message || error.message);
        alert(`Conversion failed: ${error.response?.data?.message || 'Server error'}`);
        return null;
    }
};

export const getShotXBalance = async (userAddress) => {
    if (!window.ethereum || !userAddress) return '0';

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(SHOTX_CONTRACT_ADDRESS, ShotXTokenABI, provider);
        const balanceBigInt = await contract.balanceOf(userAddress);
        const formattedBalance = ethers.formatUnits(balanceBigInt, 18);
        return formattedBalance;
    } catch (error) {
        console.error("❌ Failed to fetch ShotX balance:", error);
        return '0';
    }
};

// Fetch user's owned NFT token IDs by scanning marketplace items and checking ERC1155 balances
export const getOwnedNFTs = async (userAddress) => {
    if (!window.ethereum || !userAddress) return [];
    try {
        // 1) Get list of tokenIds from our backend (marketplace items)
        const itemsResp = await axios.get(`${API_URL}/api/items`);
        const tokenIds = (itemsResp.data || [])
            .map(it => Number(it.tokenId))
            .filter(Number.isFinite);

        // 2) Check balances on the ERC1155 contract
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const itemsContract = new ethers.Contract(SHOTX_ITEMS_ADDRESS, ShotXItemsABI, signer);

        const owned = [];
        for (const tokenId of tokenIds) {
            try {
                const bal = await itemsContract.balanceOf(userAddress, tokenId);
                if (bal && bal > 0n) owned.push(tokenId.toString());
            } catch (err) {
                console.warn(`balanceOf failed for token ${tokenId}:`, err?.message || err);
            }
        }
        return owned;
    } catch (error) {
        console.error('❌ Failed to fetch owned NFTs:', error);
        return [];
    }
};

// ===================================================================================
//  NEW MARKETPLACE FUNCTIONS
// ===================================================================================

const getContracts = async () => {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI, signer);
    const coinContract = new ethers.Contract(SHOTX_CONTRACT_ADDRESS, ShotXTokenABI, signer);
    
    return { signer, marketplaceContract, coinContract };
};

export const checkAllowance = async (price) => {
    try {
        const { signer, coinContract } = await getContracts();
        const userAddress = await signer.getAddress();
        const priceInWei = ethers.parseUnits(price.toString(), 18);

        const allowance = await coinContract.allowance(userAddress, MARKETPLACE_ADDRESS);
        
        return allowance >= priceInWei;
    } catch (error) {
        console.error("❌ Error checking allowance:", error);
        return false;
    }
};

export const approvePurchase = async (price) => {
    try {
        const { coinContract } = await getContracts();
        const priceInWei = ethers.parseUnits(price.toString(), 18);
        
        console.log(`Approving marketplace to spend ${price} SXC...`);
        const tx = await coinContract.approve(MARKETPLACE_ADDRESS, priceInWei);
        await tx.wait();
        
        console.log("✅ Approval successful!");
        return true;
    } catch (error) {
        console.error("❌ Error during approval:", error);
        return false;
    }
};

export const buyItem = async (tokenId) => {
    try {
        const { marketplaceContract } = await getContracts();
        
        console.log(`Purchasing Token ID: ${tokenId}...`);
        const tx = await marketplaceContract.purchaseItem(tokenId);
        await tx.wait();
        
        console.log(`✅ Purchase successful for Token ID: ${tokenId}!`);
        return true;
    } catch (error) {
        console.error("❌ Error purchasing item:", error);
        return false;
    }
};

export const checkNftBalance = async (tokenId) => {
    try {
        if (!window.ethereum) throw new Error("MetaMask is not installed.");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        const itemsContract = new ethers.Contract(SHOTX_ITEMS_ADDRESS, ShotXItemsABI, signer);
        
        const balance = await itemsContract.balanceOf(userAddress, tokenId);
        
        // The balance is a BigInt, so we convert it to a regular number
        return Number(balance);
    } catch (error) {
        console.error(`❌ Error checking NFT balance for token ${tokenId}:`, error);
        return 0;
    }
};  