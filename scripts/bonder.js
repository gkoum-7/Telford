const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const config = require('../hardhat.config');
const ethers = require('ethers');


const abiCoder = new ethers.utils.AbiCoder();

const web3 = createAlchemyWeb3(config.wssSource);

const sourceListenerConfig = {
    address: config.telfordSourceAddress,
    topics: [config.bridgeRequestedEventTopic]
}

const OnBridgeRequested = (txn) => {

    const raw = abiCoder.decode([ "address", "uint256", "uint256" ], txn.data)
    let event_data = {"userAddress": raw[0], "amount": raw[1].toString(), "transferId": raw[2].toString()}

    const provider = new ethers.providers.AlchemyProvider(network="optimism-kovan");
    const signer = new ethers.Wallet(config.BONDER_PRIVATE_KEY, provider);
    const telfordDestination = new ethers.Contract(config.TelfordDestinationAddress, config.TelfordDestinationABI, signer);

    async function send_tx() {
        console.log(`1. TelfordArbitrum received ${event_data.amount} Wei from ${event_data.userAddress}...`)
        event_data.amount = ethers.utils.formatEther(event_data.amount);
        const options = {value: ethers.utils.parseEther(event_data.amount)};
        const tx = await telfordDestination.depositAndDistribute(event_data.userAddress, event_data.transferId, options);
        await tx.wait();
        console.log(`2. Bonder sent ${event_data.amount} Wei to TelfordOptimism...`);
        console.log("========================================================");
    }
    send_tx();
}
web3.eth.subscribe("logs", sourceListenerConfig).on("data", OnBridgeRequested);


