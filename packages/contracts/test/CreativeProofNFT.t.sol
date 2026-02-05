// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CreativeProofNFT} from "../src/CreativeProofNFT.sol";

contract CreativeProofNFTTest is Test {
    CreativeProofNFT nft;

    function setUp() public {
        nft = new CreativeProofNFT(address(this));
    }

    function testMintStoresHashAndUri() public {
        bytes32 h = keccak256("example");
        string memory uri = "ipfs://bafy...";

        uint256 tokenId = nft.mint(address(0xBEEF), h, uri);
        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(tokenId), address(0xBEEF));
        assertEq(nft.contentHashOf(tokenId), h);
        assertEq(nft.tokenURI(tokenId), uri);
    }
}
