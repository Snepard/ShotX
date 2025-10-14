const hre = require("hardhat");

async function main() {
  // --- REPLACE WITH YOUR VALUES ---
  const contractAddress = "0xe256884B1eBC08d4130B543d91001437B1FD5e1F"; // The address of your deployed ShotXCoin contract
  const newOwnerAddress = "0xd5e6ED22B22FaF6ae0454b440071DAAe7885E398"; // The address of your backend server wallet (0xd5e...)
  // -----------------------------

  console.log(`Fetching contract at address: ${contractAddress}`);
  const shotXCoin = await hre.ethers.getContractAt("ShotXCoin", contractAddress);

  console.log(`Current owner: ${await shotXCoin.owner()}`);
  console.log(`Transferring ownership to: ${newOwnerAddress}...`);

  const tx = await shotXCoin.transferOwnership(newOwnerAddress);
  await tx.wait();

  console.log("Ownership transferred successfully!");
  console.log(`New owner: ${await shotXCoin.owner()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});