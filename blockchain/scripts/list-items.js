// This script now ONLY sets prices.
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const marketplaceAddress = "0xE3BC639099D9Aef6360653f44e0B04737251e1E0";

  // Configure the prices for your items
  const itemsToPrice = [
    { tokenId: 1, price: ethers.parseUnits("100", 18) }, // Price for one copy of Token ID 1
    // { tokenId: 2, price: ethers.parseUnits("250", 18) },
  ];

  console.log("Getting contract instances...");
  const marketplace = await hre.ethers.getContractAt("Marketplace", marketplaceAddress);

  for (const item of itemsToPrice) {
    const { tokenId, price } = item;
    console.log(`Listing Token ID ${tokenId} for ${ethers.formatUnits(price, 18)} SXC...`);
    const tx = await marketplace.listItem(tokenId, price);
    await tx.wait();
    console.log(`Token ID ${tokenId} is now priced and for sale.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});