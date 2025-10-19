async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying contract with the account:",
    deployer.address
  );

  const ShotXItemsFactory = await ethers.getContractFactory("ShotXItems");

  console.log("Initiating deployment of ShotXItems...");
  const shotXItems = await ShotXItemsFactory.deploy(deployer.address);

  await shotXItems.waitForDeployment();

  const contractAddress = await shotXItems.getAddress();
  console.log(`\n🚀 ShotXItems contract successfully deployed!`);
  console.log(`Address: ${contractAddress}`);
  console.log(`\nDon't forget to save this address and the contract's ABI for your application configuration.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("A calamitous error occurred during deployment:", error);
    process.exit(1);
  });

