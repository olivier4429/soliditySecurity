// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

//https://fravoll.github.io/solidity-patterns/pull_over_push.html
contract AuctionPullOverPush {
    address highestBidder;
    uint highestBid;
    mapping(address => uint) refunds;

    function bid() payable external {
        require(msg.value >= highestBid);

        if (highestBidder != address(0)) {
            refunds[highestBidder] += highestBid; // record the refund that this user can claim
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function withdrawRefund() external {
        uint refund = refunds[msg.sender];
        refunds[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value:refund}("");
        require(success);
    }
}