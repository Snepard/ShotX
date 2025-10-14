const { ethers } = require("hardhat");

async function main() {
  // 1. Get the contract factory
  const ShotXCoinFactory = await ethers.getContractFactory("ShotXCoin");

  // 2. Deploy the contract
  console.log("Deploying ShotXCoin contract...");
  const shotXCoin = await ShotXCoinFactory.deploy();

  // 3. Wait for the deployment to be confirmed
  await shotXCoin.waitForDeployment();

  // 4. Log the contract address
  console.log("ShotXCoin deployed to:", await shotXCoin.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});