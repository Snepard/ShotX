const hre = require("hardhat");

async function main() {
  // --- IMPORTANT ---
  // REPLACE THESE WITH YOUR ACTUAL DEPLOYED CONTRACT ADDRESSES ON SEPOLIA
  const shotXCoinAddress = "0xe256884B1eBC08d4130B543d91001437B1FD5e1F";
  const shotXItemsAddress = "0x1e62C9262f5783de42A3070cDa158a372dea6A3B";
  // --- IMPORTANT ---

  if (!shotXCoinAddress || shotXCoinAddress.includes("YOUR")) {
    console.error("Please replace the placeholder for shotXCoinAddress.");
    process.exit(1);
  }

  if (!shotXItemsAddress || shotXItemsAddress.includes("YOUR")) {
    console.error("Please replace the placeholder for shotXItemsAddress.");
    process.exit(1);
  }

  console.log("Deploying Marketplace contract...");

  const marketplace = await hre.ethers.deployContract("Marketplace", [
    shotXCoinAddress,
    shotXItemsAddress,
  ]);

  await marketplace.waitForDeployment();

  console.log(
    `Marketplace deployed successfully to address: ${marketplace.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});