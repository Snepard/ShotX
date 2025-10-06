// In a real app, this would use ethers.js, web3modal, etc.
export const MOCK_CONTRACT_ADDRESS = '0x1234567890AbCdEf1234567890aBcDeF12345678';

// The 'export' keyword here makes this object available to other files.
export const web3Mock = {
  connectWallet: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      address: '0xAbC...dE89',
      balance: 1250.75,
    };
  },
  simulateMintTokensForScore: async (score) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Simulating minting tokens for a score of ${score}`);
    return score / 100;
  },
  simulateBuy: async (itemId, currentBalance) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const item = featuredNFTsData.find(nft => nft.id === itemId);
    if (!item) throw new Error("Item not found");
    if (currentBalance < item.price) {
      throw new Error("Insufficient balance");
    }
    console.log(`Simulating purchase of item ${itemId} for ${item.price} SHOTX`);
    return { success: true, item, newBalance: currentBalance - item.price };
  },
};

// Ensure these are also exported so HomePage.jsx can use them.
export const featuredNFTsData = [
  { id: 1, name: 'Cyber Glider', price: 250, image: 'https://placehold.co/600x800/0d0c22/67f8f8/png?text=Cyber\\nGlider' },
  { id: 2, name: 'Neon Blade', price: 400, image: 'https://placehold.co/600x800/0d0c22/ff00ff/png?text=Neon\\nBlade' },
  { id: 3, name: 'Holo Shield', price: 320, image: 'https://placehold.co/600x800/0d0c22/00f2ff/png?text=Holo\\nShield' },
  { id: 4, name: 'Pulse Rifle', price: 600, image: 'https://placehold.co/600x800/0d0c22/f8d867/png?text=Pulse\\nRifle' },
];

export const initialLeaderboardData = [
    { rank: 1, name: 'Zephyr', score: 15430, avatar: '🏆' },
    { rank: 2, name: 'Nexus', score: 14980, avatar: '🥈' },
    { rank: 3, name: 'Glitch', score: 14550, avatar: '🥉' },
    { rank: 4, name: 'Rogue', score: 13900, avatar: '🤖' },
    { rank: 5, name: 'Cygnus', score: 13210, avatar: '👾' },
    { rank: 6, name: 'Vortex', score: 12870, avatar: '👽' },
    { rank: 7, name: 'Echo', score: 12500, avatar: '🧑‍🚀' },
    { rank: 8, name: 'Jolt', score: 11990, avatar: '🚀' },
    { rank: 9, name: 'Fuse', score: 11500, avatar: '☄️' },
    { rank: 10, name: 'Blitz', score: 11230, avatar: '✨' },
];