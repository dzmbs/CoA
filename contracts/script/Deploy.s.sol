// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MfiEscrow} from "../src/MfiEscrow.sol";

/**
 * Deploy MfiEscrow to Monad.
 *
 *   export PK=0x<deployer-private-key>          # needs real MON for gas on mainnet
 *   forge script script/Deploy.s.sol \
 *     --rpc-url monad --broadcast --private-key $PK
 *
 * The deployer becomes the keeper (the monitor allowed to slash). Copy the
 * printed address into packages/shared/src/addresses.ts -> MFI_CONTRACTS.escrow.
 */
contract Deploy is Script {
    function run() external returns (MfiEscrow escrow) {
        address keeper = vm.envOr("KEEPER", address(0)); // 0 => deployer
        vm.startBroadcast();
        escrow = new MfiEscrow(keeper);
        vm.stopBroadcast();
        console2.log("MfiEscrow deployed at:", address(escrow));
        console2.log("keeper:", escrow.keeper());
    }
}
