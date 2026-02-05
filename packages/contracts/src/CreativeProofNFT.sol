// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Minimal proof-of-authorship NFT.
/// Stores a content hash (bytes32) + metadata URI per token.
contract CreativeProofNFT is ERC721, Ownable {
    uint256 public nextTokenId;

    mapping(uint256 tokenId => bytes32) public contentHashOf;
    mapping(uint256 tokenId => string) private _tokenURIs;

    event Minted(uint256 indexed tokenId, address indexed to, bytes32 indexed contentHash, string metadataURI);

    constructor(address initialOwner) ERC721("CreativeProof", "CPROOF") Ownable(initialOwner) {}

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function mint(address to, bytes32 contentHash, string calldata metadataURI) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        _safeMint(to, tokenId);

        contentHashOf[tokenId] = contentHash;
        _tokenURIs[tokenId] = metadataURI;

        emit Minted(tokenId, to, contentHash, metadataURI);
    }
}
