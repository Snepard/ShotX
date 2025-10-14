// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ShotXCoin
 * @dev This is the ERC20 token for the ShotX game.
 * The owner of the contract can mint new tokens and award them to players.
 */
contract ShotXCoin is ERC20, Ownable {

    /**
     * @dev Sets the name and symbol for the token, and sets the initial owner.
     * msg.sender is the address that deploys the contract.
     */
    // FIX: We now pass msg.sender to the Ownable constructor
    constructor() ERC20("ShotX Coin", "SXC") Ownable(msg.sender) {}

    /**
     * @notice Creates a specified amount of new tokens and sends them to a player.
     * @dev Can only be called by the owner of the contract.
     * @param player The address of the player who will receive the coins.
     * @param amount The amount of coins to mint (in the smallest unit, e.g., wei).
     */
    function awardCoins(address player, uint256 amount) public onlyOwner {
        _mint(player, amount);
    }
}