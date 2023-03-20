// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4 <0.9.0;

import {Script} from "forge-std/Script.sol";
import {RootManager} from "contracts/RootManager.sol";
import {MerkleTreeManager} from "contracts/MerkleTreeManager.sol";

abstract contract Deploy is Script {
    function _deployRootManager() internal {
        vm.startBroadcast();
        MerkleTreeManager merkleTreeManager = new MerkleTreeManager();
        new RootManager(address(merkleTreeManager));
        vm.stopBroadcast();
    }
}

contract DeployRootManager is Deploy {
    function run() external {
        _deployRootManager();
    }
}
