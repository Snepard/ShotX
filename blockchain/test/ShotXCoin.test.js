const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShotXCoin Contract", function () {
  let owner, player1;
  let shotXCoin;

  beforeEach(async function () {
    [owner, player1] = await ethers.getSigners();
    const ShotXCoinFactory = await ethers.getContractFactory("ShotXCoin");
    shotXCoin = await ShotXCoinFactory.deploy();
  });

  it("Should set the correct name and symbol on deployment", async function () {
    expect(await shotXCoin.name()).to.equal("ShotX Coin");
    expect(await shotXCoin.symbol()).to.equal("SXC");
  });

  describe("awardCoins function", function () {
    it("Should allow the owner to mint tokens to a player", async function () {
      const mintAmount = ethers.parseUnits("100", 18);
      await shotXCoin.connect(owner).awardCoins(player1.address, mintAmount);
      const playerBalance = await shotXCoin.balanceOf(player1.address);
      expect(playerBalance).to.equal(mintAmount);
    });

    it("Should NOT allow a non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("50", 18);

      // FIX: Check for the modern 'OwnableUnauthorizedAccount' custom error
      // and verify that the unauthorized account was player1.
      await expect(
        shotXCoin.connect(player1).awardCoins(player1.address, mintAmount)
      ).to.be.revertedWithCustomError(
        shotXCoin,
        "OwnableUnauthorizedAccount"
      ).withArgs(player1.address);
    });
  });
});