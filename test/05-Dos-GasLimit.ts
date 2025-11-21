import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();


//First a function to deploy the Voting contract
async function setUpSmartContract() {
  const voting = await ethers.deployContract("Voting", {
    value: 10_000_000_000_000_000n, //0.01 ETH to fund the contract
  });

  //get the accounts provided by hardhat:
  const signersRegistered = await ethers.getSigners(); //Array of SignerWithAddress objects
  const signerNotRegistered = signersRegistered.pop()!; //remove the last address. this one will not be registered. And ! to tell TS that it is not undefined

  return { voting, signersRegistered, signerNotRegistered };
}


describe("DosUnexpectedError", function () {


  it("Should do a DoS", async function () {
    const { voting, signersRegistered } = await setUpSmartContract();
    const attack = await ethers.deployContract("AttackDosGasLimit", [voting.target]);


    for (const a of signersRegistered) {
      await voting.addVoter(a.address);
    }
    await voting.addVoter(attack.target);

    await voting.startProposalsRegistering();

    //Call attackStep 100 times to consume gas
    for (let i = 0; i < 100; i++) {
      console.log(`Attack step ${i + 1}/28`);
      await attack.attackStep();
    }
    //End of attack 

    await voting.endProposalsRegistering();
    await voting.startVotingSession();

    await voting.connect(signersRegistered[0]).setVote(0); //voter 0 votes for proposal 0
    await voting.connect(signersRegistered[1]).setVote(1); //voter 1 votes for proposal 1
    await voting.connect(signersRegistered[2]).setVote(2); //voter 2 votes for proposal 2
    await voting.connect(signersRegistered[3]).setVote(2); //voter 3 votes for proposal 2

    await voting.endVotingSession();

    ///TallyVotes should be blocked by the DoS attack : too much gas needed to process 
    await expect(voting.tallyVotes()).to.be.rejectedWith("out of gas");

  });


});
