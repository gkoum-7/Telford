const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TelfordSource", function () {
	let telfordSource;
	let user;
	let bonder;
	let l1Relayer;
	let otherAccount;

	let bridgeAmount  = ethers.utils.parseEther("0.8");
	let bonderPayment = ethers.utils.parseEther("0.8002");

	beforeEach("setup accounts", async () => {
		const accounts = await ethers.getSigners();

		user = accounts[0];
		bonder = accounts[1];
		l1Relayer = accounts[2];
		otherAccount = accounts[3];

		const TelfordSource = await ethers.getContractFactory("TelfordSource");
		telfordSource = await TelfordSource.deploy(bonder.address, l1Relayer.address);
		
		await telfordSource.deployed();
	});

	describe("bridge", function () {
		it("should revert when ether sent is less than or equal to the bonder fee", async function () {
			await expect(telfordSource.connect(user).bridge())
				.to.be.revertedWith("Ether sent must be greater than the bonder fee!");
		});

		it("should successfully deposit 1 ETH into contract, from user", async () => {
            const contractAddress = telfordSource.address;
            const tx = await telfordSource.connect(user).bridge({value: bonderPayment});
            expect(tx).to.changeEtherBalances([user, contractAddress], [ethers.utils.parseEther("-1"), bonderPayment]);
        });

		it("should emit an event", async function () {
			await expect(telfordSource.connect(user).bridge({value: bonderPayment}))
				.to.emit(telfordSource, "BridgeRequested")
				.withArgs(user.address, bridgeAmount, 1);
		});
	});

	describe("fundsReceivedOnDestination", function () {
		it("should revert when not called by the L1Relayer", async function () {
			await telfordSource.connect(user).bridge({value: bonderPayment});

			await expect(telfordSource.connect(otherAccount).fundsReceivedOnDestination(1, bridgeAmount))
				.to.be.revertedWith("Sorry pal, I can only be called by the L1Relayer!");
		});

		it("should revert when transferId and bridgeAmount dont match up", async function () {
			await telfordSource.connect(user).bridge({value: bonderPayment});

			await expect(telfordSource.connect(l1Relayer).fundsReceivedOnDestination(2, bridgeAmount))
				.to.be.revertedWith("UH OH! The transferId and bridgeAmount dont match!");
		});

		it("should successfully deposit 1 ETH into bonder account, from contract", async () => {
            const contractAddress = telfordSource.address;
			await telfordSource.connect(user).bridge({value: bonderPayment});

            const tx = await telfordSource.connect(l1Relayer).fundsReceivedOnDestination(1, bridgeAmount);
            expect(tx).to.changeEtherBalances([contractAddress, bonder], [ethers.utils.parseEther("-1"), bonderPayment]);
        });

		it("should emit an event", async function () {
			await telfordSource.connect(user).bridge({value: bonderPayment});

			await expect(telfordSource.connect(l1Relayer).fundsReceivedOnDestination(1, bridgeAmount))
				.to.emit(telfordSource, "BonderReimbursed")
				.withArgs(bonderPayment, 1);
		});
	});
});
