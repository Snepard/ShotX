// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Marketplace is Ownable, ReentrancyGuard, ERC1155Holder {
    // Variable for your game's currency contract
    IERC20 public shotXCoin;
    // Variable for your NFT items contract
    IERC1155 public shotXItems;

    struct Listing {
        uint256 price;
        bool isForSale;
    }

    // A mapping from a Token ID to its listing details
    mapping(uint256 => Listing) public listings;

    // Event to announce a successful purchase
    event ItemPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    // Event to announce a new item is listed
    event ItemListed(
        uint256 indexed tokenId,
        uint256 price
    );

    // The constructor sets the addresses of your coin and NFT contracts
    constructor(address _coinAddress, address _nftAddress) Ownable(msg.sender) {
        shotXCoin = IERC20(_coinAddress);
        shotXItems = IERC1155(_nftAddress);
    }

    // Function for the owner to list an item for sale
    function listItem(uint256 _tokenId, uint256 _price) external onlyOwner {
    require(_price > 0, "Price must be greater than zero");
    require(shotXItems.balanceOf(address(this), _tokenId) > 0, "Marketplace has no stock of this item");

    listings[_tokenId] = Listing({
        price: _price,
        isForSale: true
    });

    emit ItemListed(_tokenId, _price);
    }

    // The main purchase function for players
    function purchaseItem(uint256 _tokenId) external nonReentrant {
    Listing storage listing = listings[_tokenId];
    address buyer = msg.sender;

    require(listing.isForSale, "Item not for sale");
    uint256 price = listing.price;

    uint256 allowance = shotXCoin.allowance(buyer, address(this));
    require(allowance >= price, "Check token approval");

    shotXCoin.transferFrom(buyer, owner(), price);

    // Transfer ONE copy of the NFT. The listing remains active.
    shotXItems.safeTransferFrom(address(this), buyer, _tokenId, 1, "");

    emit ItemPurchased(_tokenId, buyer, price);
}
}