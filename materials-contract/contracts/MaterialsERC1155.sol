// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MaterialsERC1155 is ERC1155, Ownable {
    // Identifiants des matériaux
    uint256 public constant ORGANIC_COTTON = 1;
    uint256 public constant RECYCLED_DENIM = 2;
    uint256 public constant NATURE_DYE     = 3;
    uint256 public constant HEMP_THREAD    = 4;

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    function mintMaterials(address to, uint256 id, uint256 amount) external onlyOwner {
        _mint(to, id, amount, "");
    }

    function mintBatchMaterials(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }
}
