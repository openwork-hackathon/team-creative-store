// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {CreativeProofNFT} from "../src/CreativeProofNFT.sol";

contract DeployCreativeProof is Script {
    function run() external returns (CreativeProofNFT nft) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);
        nft = new CreativeProofNFT(deployer);
        vm.stopBroadcast();
    }
}
