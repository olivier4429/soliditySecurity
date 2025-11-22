import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();


describe("InsecureArithmetic", async function () {

  //Overflow => 0
  //Undeflow => the biggest value possible.  
  //Test not needed in Solidity 0.8+ as it has built-in protections against overflows and underflows

});
