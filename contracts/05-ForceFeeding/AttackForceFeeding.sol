// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract ForceFeeder {

    constructor() payable {}

    // Forces the sending of ETH to a target via selfdestruct.
    function attack(address target) external {
        selfdestruct(payable(target));
    }
}