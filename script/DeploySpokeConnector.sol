// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4 <0.9.0;

import {Script} from "forge-std/Script.sol";
import {SpokeConnector} from "contracts/SpokeConnector.sol";

abstract contract Deploy is Script {
    function _deploySpokeConnector() internal {
        vm.startBroadcast();
        new SpokeConnector();
        vm.stopBroadcast();
    }
}

contract DeploySpokeConnector is Deploy {
    function run() external {
        _deploySpokeConnector();
    }
}
