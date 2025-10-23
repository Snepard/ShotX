// This script transfers a batch of NFTs to the marketplace.
const hre = require("hardhat");

async function main() {
  const marketplaceAddress = "0xE3BC639099D9Aef6360653f44e0B04737251e1E0";
  const shotXItemsAddress = "0x1e62C9262f5783de42A3070cDa158a372dea6A3B";

  // Configure the items and quantity to stock
  const itemsToStock = [
    { tokenId: 1, quantity: 500 }, // Stock the marketplace with 500 copies of Token ID 1
  ];

  console.log("Getting contract instances and signer...");
  const [signer] = await hre.ethers.getSigners();
  const shotXItems = await hre.ethers.getContractAt("ShotXItems", shotXItemsAddress);

  for (const item of itemsToStock) {
    const { tokenId, quantity } = item;
    console.log(`Transferring ${quantity} copies of Token ID ${tokenId} to the marketplace...`);
    
    // Transfer from your wallet (signer) to the marketplace
    const tx = await shotXItems.safeTransferFrom(signer.address, marketplaceAddress, tokenId, quantity, "0x");
    await tx.wait();
    
    console.log(`Successfully stocked Token ID ${tokenId}.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});