const hre = require("hardhat");

async function main() {
  // --- REPLACE WITH YOUR VALUES ---
  const contractAddress = "0xe256884B1eBC08d4130B543d91001437B1FD5e1F"; // The address of your deployed ShotXCoin contract
  const newOwnerAddress = "0x5015689ED3d89B65164Ef832Fa1E4D2C58cf7d73"; // The address of your backend server wallet (0xd5e...)
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