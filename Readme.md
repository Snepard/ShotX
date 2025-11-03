<div align="center">
  <img src="Frontend/public/ShotXLogo.png" alt="ShotX Logo" width="200"/>

  <h1 align="center">A Web3 Canvas Shooter</h1>

  <p align="center">
    <strong>Aim. Score. Own Your Gear.</strong><br/>
    A full-stack Web3 game that merges skill-based gameplay with blockchain rewards.
  </p>

  <p align="center">
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white"/>
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white"/>
    <img alt="Solidity" src="https://img.shields.io/badge/Solidity-0.8.x-363636?logo=solidity&logoColor=white"/>
    <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white"/>
    <img alt="Ethers.js" src="https://img.shields.io/badge/Ethers.js-v6-2C56F6?logo=ethereum&logoColor=white"/>
    <img alt="Hardhat" src="https://img.shields.io/badge/Hardhat-EVM-F7F7F7?logo=hardhat&logoColor=black"/>
  </p>
</div>

---

## 🕹️ Overview

**ShotX** is a dynamic **"Skill-to-Earn"** Web3 game where your shooting accuracy and reaction speed directly translate into **on-chain rewards**.

Players can:
- Earn in-game score and **convert it into ERC20 tokens (SXC)**.
- Spend tokens to buy **ERC1155 NFT skins** from the **Marketplace**.
- View and manage their NFTs through a personalized **Profile Dashboard**.

This project demonstrates a **complete Web3 stack** — from **React frontend** to **Solidity smart contracts**, bridged by a **Node.js backend**.

---

## ✨ Key Features

### 🎮 Canvas-Based Gameplay
A responsive shooter built with **React 19** and **HTML5 Canvas**, optimized for smooth performance.

### 💰 Skill-to-Earn
Accumulate off-chain points that can be **converted into ShotX Coin (SXC)**, minted on-chain via the backend admin wallet.

### 🔒 Web3 Authentication
Login securely using **MetaMask** signature — no passwords needed.  
Sessions are managed with **JWT cookies**.

### 🏪 NFT Marketplace
Buy unique **ERC1155 player skins** using your SXC tokens.  
All items are listed and managed through smart contracts.

### 👤 User Profiles
Customize your **username** and **avatar (via Cloudinary)**, and view your owned NFTs and token balances in real-time.

### 🕹️ Dynamic Inventory
Your NFT inventory automatically syncs with **on-chain balances** using the `ShotXItems` contract.

### 🛠️ Admin Minting Panel
A secure admin dashboard for minting new NFT items:
1. Uploads image → **Cloudinary**  
2. Uploads metadata → **IPFS (Pinata)**  
3. Mints ERC1155 token → **Admin wallet**  
4. Transfers token stock → **Marketplace**  
5. Lists item with price → **Smart contract call**

---

## 🧩 Tech Stack

### **Frontend (Client)**
- ⚛️ React 19 (Vite)
- 🌐 React Router v7
- 💅 Tailwind CSS + Framer Motion
- 🎞️ GSAP for homepage animations
- 🔗 Ethers.js v6 for wallet & contract integration

### **Backend (Server)**
- 🟢 Node.js + Express
- 🗃️ MongoDB + Mongoose
- 🪙 Ethers.js v6 (Admin wallet interactions)
- 🔐 JWT + Cookie Parser (authentication)
- ☁️ Cloudinary + Multer (image uploads)

### **Blockchain (Smart Contracts)**
- 💎 Solidity (Hardhat)
- 🧱 OpenZeppelin (ERC20, ERC1155, Ownable)
- 📜 **Contracts:**
  - **ShotXCoin.sol** → ERC20 token (mintable by owner)
  - **ShotXItems.sol** → ERC1155 NFT collection
  - **Marketplace.sol** → Handles NFT purchases and SXC transfers

---

## 🔄 The Core Loop

1. **Login** → Connect MetaMask → Backend verifies signature → JWT session created.  
2. **Play** → Score updates on backend (`accumulatedScore`, `highestScore`).  
3. **Convert** → Backend mints SXC via admin wallet → Sent to player’s address.  
4. **Shop** → Fetch items from `/api/items` → Display via Marketplace UI.  
5. **Buy** → User approves SXC spending → Calls `purchaseItem()` on Marketplace.  
6. **Transfer** → Contract transfers NFT to user & SXC to admin.  
7. **Own** → Profile page fetches and displays owned NFTs.

---

## 🌐 Live Demo

The project is live on **Sepolia Testnet**!

> 💡 You’ll need:
> - **MetaMask** extension  
> - Some **Sepolia ETH** for gas  

👉 **[View Live Demo](https://shotx.onrender.com)**

---

## 🧠 Author’s Note

ShotX isn’t just a game — it’s a demonstration of how **blockchain, gaming, and front-end innovation** can intersect to create a truly interactive, decentralized experience.

---

## 📁 Repository Structure

```bash
ShotX/
│
├── frontend/                  # React + Vite client
│   ├── src/
│   └── public/
│
├── backend/                   # Node.js + Express + MongoDB server
│   ├── routes/
│   ├── models/
│   └── controllers/
│
└── blockchain/                # Solidity contracts (Hardhat)
    ├── contracts/
    └── scripts/
```
---
## 🧾 License This project is licensed under the **MIT License**. 
