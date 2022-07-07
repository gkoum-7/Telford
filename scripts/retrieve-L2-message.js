
sdk = require("@eth-optimism/sdk")


async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy

    l1Signer = await ethers.getSigner()
    crossChainMessenger = new sdk.CrossChainMessenger({
        l1ChainId: 42,
        l1SignerOrProvider: l1Signer,
        l2SignerOrProvider: new ethers.providers.JsonRpcProvider("https://kovan.optimism.io")
    })
    hash = //tx hash from L2
        console.log((await crossChainMessenger.getMessageStatus(hash)) == sdk.MessageStatus.READY_FOR_RELAY)
    console.log((await crossChainMessenger.finalizeMessage(hash)))


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });