// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ShotXItems is ERC1155, Ownable {
    uint256 private _tokenIdCounter;

    string public baseURI;

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    // MODIFIED: The existence check has been removed to align with the standard
    // OpenZeppelin ERC1155 implementation. The responsibility for querying a valid
    // token ID now lies with the client/caller.
    function uri(uint256 tokenId) public view override returns (string memory) {
        return
            string(
                abi.encodePacked(baseURI, "/", Strings.toString(tokenId), ".json")
            );
    }

    function mint(uint256 amount) public onlyOwner {
        _tokenIdCounter++;
        uint256 newItemId = _tokenIdCounter;
        _mint(owner(), newItemId, amount, "");
    }
    
    function mintUnique() public onlyOwner {
        _tokenIdCounter++;
        uint256 newItemId = _tokenIdCounter;
        _mint(owner(), newItemId, 1, "");
    }

    function setBaseURI(string memory newURI) public onlyOwner {
        baseURI = newURI;
    }
}

