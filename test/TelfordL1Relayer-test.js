const { expect, assert } = require("chai");
const { ethers } = require("hardhat");


describe("L1Relayer", async () => {
    let l1Relayer;
    let telfordSource, telfordDestination, bonder, user, randomEOA;

    let amount = ethers.utils.parseEther("1");
    let transferId = 1;

    beforeEach("deploy contract", async () => {
        // get accounts using signers
        const accounts = await ethers.getSigners();
        telfordSource = accounts[0];
        telfordDestination = accounts[1];
        bonder = accounts[2];
        user = accounts[3];
        randomEOA = accounts[4];


        // get contract using ContractFactory
        const L1Relayer = await ethers.getContractFactory("L1Relayer");

        // deployed instance
        l1Relayer = await L1Relayer.deploy(telfordSource.address, telfordDestination.address);

        await l1Relayer.deployed();
    });

    describe("receiveDestinationTransferConfirmation", () => {

        it("should revert when not called by optimismMessenger contract via the telfordDestination contract", async () => {
            await expect(l1Relayer.connect(randomEOA).receiveDestinationTransferConfirmation(bonder.address, user.address, amount, transferId))
                .to.be.revertedWith("Only the Telford Destination Contract can perform this operation!");
        });
    });
});