import { ethers } from 'ethers';
import axios from 'axios';

// The backend URL is now correctly pointed to port 5001.
const API_URL = 'http://localhost:5001';

/**
 * Verifies if a user has an existing valid session cookie.
 */
export const verifyExistingLogin = async () => {
    try {
        // Use `withCredentials` to ensure cookies are sent with the request.
        const response = await axios.get(`${API_URL}/auth/verify`, { withCredentials: true });
        if (response.data && response.data.loggedIn) {
            console.log("✅ Existing session verified for address:", response.data.address);
            return response.data.address;
        }
        return null;
    } catch (error) {
        // This is expected if the user is not logged in, so we log it for info.
        console.log("Verification check failed:", error.message);
        return null;
    }
};

/**
 * Handles the full authentication flow: connect, sign, and log in.
 * @returns {object|null} The authenticated user's full data object or null on failure.
 */
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

        // MODIFIED: Capture the response from the login request.
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            address,
            signature,
            message,
        }, { withCredentials: true }); // Send cookies

        console.log("6. ✅ Login successful! User is authenticated.");
        
        // MODIFIED: Return the full user object from the backend response.
        return loginResponse.data.user;

    } catch (error) {
        console.error("❌ Failed to connect wallet and authenticate:", error);
        return null;
    }
};

/**
 * Fetches the complete user profile data from the backend.
 * @param {string} walletAddress The user's wallet address.
 * @returns {object|null} The user data object or null on failure.
 */
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

/**
 * Calls the backend to convert the user's accumulated score into ShotX coins.
 * @param {string} walletAddress The user's wallet address.
 */
export const convertScoreToCoins = async (walletAddress) => {
    try {
        const response = await axios.post(`${API_URL}/api/score/convert`, { walletAddress });
        console.log("✅ Score conversion successful:", response.data.message);
        alert(response.data.message); // Provide feedback to the user
        return response.data;
    } catch (error) {
        console.error("❌ Score conversion failed:", error.response?.data?.message || error.message);
        alert(`Conversion failed: ${error.response?.data?.message || 'Server error'}`);
        return null;
    }
};

