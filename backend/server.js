const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// --- Blockchain Setup ---
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.BACKEND_WALLET_PRIVATE_KEY, provider);
const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "awardCoins",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

// --- JWT Secret ---
const JWT_SECRET = 'your-super-secret-key-for-shotx';

const app = express();
const PORT = 3001;

// --- Middleware Setup ---
// Allow requests from your frontend and enable credentials (cookies)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser

const playerData = {};

console.log(`Backend server wallet address: ${wallet.address}`);

// --- AUTHENTICATION ENDPOINTS ---
app.get('/auth/message', (req, res) => {
  res.json({ message: `Welcome to ShotX! Sign this message to log in. Nonce: ${Date.now()}` });
});

app.post('/auth/login', async (req, res) => {
  const { address, signature, message } = req.body;
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1h' });
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });
      res.status(200).json({ message: "Logged in successfully" });
    } else {
      res.status(401).send("Invalid signature");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Error during login");
  }
});

app.get('/auth/verify', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ loggedIn: true, address: decoded.address });
  } catch (err) {
    res.status(401).json({ loggedIn: false });
  }
});

// --- GAME DATA ENDPOINTS ---
app.get('/player-data/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const data = playerData[walletAddress.toLowerCase()] || { accumulatedScore: 0, highestScore: 0 };
  res.json(data);
});

app.post('/update-score', (req, res) => {
  const { walletAddress, newScore } = req.body;
  const lowerCaseAddress = walletAddress.toLowerCase();

  if (!playerData[lowerCaseAddress]) {
    playerData[lowerCaseAddress] = { accumulatedScore: 0, highestScore: 0 };
  }

  playerData[lowerCaseAddress].accumulatedScore += newScore;
  if (newScore > playerData[lowerCaseAddress].highestScore) {
    playerData[lowerCaseAddress].highestScore = newScore;
  }
  
  res.status(200).json({ message: "Score updated successfully", data: playerData[lowerCaseAddress] });
});

app.post('/convert-score', async (req, res) => {
  const { walletAddress } = req.body;
  const lowerCaseAddress = walletAddress.toLowerCase();

  if (!playerData[lowerCaseAddress] || playerData[lowerCaseAddress].accumulatedScore <= 0) {
    return res.status(400).json({ message: "No score to convert." });
  }

  const scoreToConvert = playerData[lowerCaseAddress].accumulatedScore;
  const coinsToMint = Math.floor(scoreToConvert / 10);
  
  if (coinsToMint <= 0) {
    return res.status(400).json({ message: "Not enough score to convert to a single coin."});
  }

  const amountToMint = ethers.parseUnits(coinsToMint.toString(), 18);

  console.log(`Attempting to mint ${coinsToMint} SXC for ${lowerCaseAddress}`);

  try {
    const tx = await contract.awardCoins(lowerCaseAddress, amountToMint);
    console.log(`Transaction sent! Hash: ${tx.hash}`);
    await tx.wait();
    console.log(`Transaction confirmed! Minted ${coinsToMint} SXC.`);
    playerData[lowerCaseAddress].accumulatedScore = 0;
    res.status(200).json({ message: `Successfully converted score and minted ${coinsToMint} SXC!`, txHash: tx.hash });
  } catch (error) {
    console.error("Blockchain transaction failed:", error);
    res.status(500).json({ message: "Failed to mint coins due to a network error." });
  }
});

app.listen(PORT, () => {
  console.log(`ShotX backend server is running on http://localhost:${PORT}`);
});