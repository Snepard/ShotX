require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // This line loads your .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28", // Make sure this version is correct
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL, // Loads the RPC URL from .env
      accounts: [process.env.PRIVATE_KEY], // Loads the private key from .env
    },
  },
};