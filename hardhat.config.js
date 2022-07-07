require("@nomiclabs/hardhat-waffle");
require("hardhat-watcher");
require("hardhat-tracer");
require('solidity-coverage');
require('dotenv').config();

// Web3 Provider Keys
const ETH_MAINNET_ALCHEMY_KEY = process.env.ETH_MAINNET_ALCHEMY_API_KEY;
const ROPSTEN_INFURA_KEY = process.env.ROPSTEN_INFURA_API_KEY;
const ARBITRUM_RINKEBY_ALCHEMY_KEY = process.env.ARBITRUM_RINKEBY_ALCHEMY_API_KEY;
const OPTIMISM_KOVAN_ALCHEMY_KEY = process.env.OPTIMISM_KOVAN_ALCHEMY_API_KEY;
const KOVAN_INFURA_KEY = process.env.KOVAN_INFURA_API_KEY;

// Wallet Private Keys
const WALLET_PRIVATE_KEY = process.env.DEV_WALLET_PRIVATE_KEY;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  wssSource: `wss://arb-rinkeby.g.alchemy.com/v2/${ARBITRUM_RINKEBY_ALCHEMY_KEY}`,
  telfordSourceAddress: "0x03EFaDa4c8f815a504b38D30eec543D16CbeDE1b",
  bridgeRequestedEventTopic : "0x05a5ddd55d3ee0917a93dae8216432109f76bf3125ed9e74e55c60045c9a1307",
  BONDER_PRIVATE_KEY : WALLET_PRIVATE_KEY,
  TelfordDestinationAddress: "0xf1936e891a16AE843ED1304C74d9fe4e50E05472",
  solidity: "0.8.4",
  watcher: {
    c: {
      tasks: ['compile'],
    },
    c: {
      tasks: ['test'],
    },
    cct: {
      tasks: ['clean', 'compile', 'test'],
    },
  },
  networks: {
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ETH_MAINNET_ALCHEMY_KEY}`,
      accounts: [`${WALLET_PRIVATE_KEY}`]
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${KOVAN_INFURA_KEY}`,
      accounts: [`${WALLET_PRIVATE_KEY}`]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${ROPSTEN_INFURA_KEY}`,
      accounts: [`${WALLET_PRIVATE_KEY}`]
    },
    networks: {
      hardhat: {
        chainId: 1337,
      },
    },
    arbitrum_rinkeby: {
      url: `https://arb-rinkeby.g.alchemy.com/v2/${ARBITRUM_RINKEBY_ALCHEMY_KEY}`,
      accounts: [`${WALLET_PRIVATE_KEY}`]
    },
    optimism_kovan: {
      url: `https://opt-kovan.g.alchemy.com/v2/${OPTIMISM_KOVAN_ALCHEMY_KEY}`,
      accounts: [`${WALLET_PRIVATE_KEY}`]
    }
  },
  TelfordDestinationABI: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_bonder",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_l2CrossDomainMessenger",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_l1Relayer",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "transferId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "bonder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "contractAddr",
          "type": "address"
        }
      ],
      "name": "RelayTransferConfirmation",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "transferId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "bonder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "contractAddr",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "TransferFromBonder",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "transferId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "contractAddr",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "bonder",
          "type": "address"
        }
      ],
      "name": "TransferToUser",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "bonder",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_transferId",
          "type": "uint256"
        }
      ],
      "name": "depositAndDistribute",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "l1Relayer",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "l2CrossDomainMessenger",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_bonder",
          "type": "address"
        }
      ],
      "name": "setBonder",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_l1Relayer",
          "type": "address"
        }
      ],
      "name": "setL1Relayer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_l2CrossDomainMessenger",
          "type": "address"
        }
      ],
      "name": "setl2CrossDomainMessenger",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  ,

};