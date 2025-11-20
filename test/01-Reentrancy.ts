import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Reentrancy : Attack vulnerable contract", function () {
  it("Should stole the whole wallet.", async function () {
    const signers = await ethers.getSigners();
    const vault = await ethers.deployContract("Vault");

    console.log("Vault deployed to:", vault.target);

    const vaultBalanceInit = await ethers.provider.getBalance(vault.target);
    expect(vaultBalanceInit).to.equal(0n);


    const attack = await ethers.deployContract("AttackReentrancy", [vault.target]);
    await vault.connect(signers[1]).store({ value: ethers.parseEther("1") });
    await vault.connect(signers[2]).store({ value: ethers.parseEther("2") });

    console.log("Vault balance before attack :", await ethers.provider.getBalance(vault.target));
    console.log("Attack balance before attack :", await ethers.provider.getBalance(attack.target));
    
    const vaultBalance = await ethers.provider.getBalance(vault.target);
    expect(vaultBalance).to.equal(ethers.parseEther("3"));
    await attack.attack({ value: ethers.parseEther("5") });
    const vaultBalanceAfterAttack = await ethers.provider.getBalance(vault.target);
    expect(vaultBalanceAfterAttack).to.equal(0n);
    const attackBalance = await ethers.provider.getBalance(attack.target);
    expect(attackBalance).to.equal(ethers.parseEther("8"));

    console.log("Vault balance after attack :", await ethers.provider.getBalance(vault.target));
    console.log("Attack balance after attack :", await ethers.provider.getBalance(attack.target));
  });


});
