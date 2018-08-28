require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider');
const WalletProvider = require("truffle-wallet-provider");
const Wallet = require('ethereumjs-wallet');

// const providerWithMnemonic = (mnemonic, rpcEndpoint) =>
//   new HDWalletProvider(mnemonic, rpcEndpoint);

const providerWithPrivateKey = (privateKey, rpcEndpoint) => {
  let prviateKeyBuffer = new Buffer(privateKey, "hex");
  let wallet = Wallet.fromPrivateKey(prviateKeyBuffer);
  return new WalletProvider(wallet,  rpcEndpoint);
}

// const infuraProviderMnemonic = (network, mnemonic) => providerWithMnemonic(
//    mnemonic,
//   `https://${network}.infura.io/${process.env.INFURA_API_KEY}`
// );

const infuraProviderPrivateKey = (network, privateKey) => providerWithPrivateKey(
   privateKey,
  `https://${network}.infura.io/${process.env.INFURA_API_KEY}`
);

// const ropstenProvider = process.env.SOLIDITY_COVERAGE
//   ? undefined
//   : infuraProviderPrivateKey('ropsten', process.env.ROPSTEN_PRIVATE_KEY);

// const ropstenProvider = process.env.SOLIDITY_COVERAGE
//   ? undefined
//   : infuraProviderMnemonic('ropsten', process.env.MNEMONIC);

// const rinkebyProvider = process.env.SOLIDITY_COVERAGE
//   ? undefined
//   : infuraProviderPrivateKey('rinkeby', process.env.RINKEBY_PRIVATE_KEY);

module.exports = {
  networks: {
    truffle: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*" // Match any network id
    },
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
    },
    // ropsten: {
    //   provider: ropstenProvider,
    //   network_id: 3, // eslint-disable-line camelcase
    //   // gasPrice: 476503
    // },
    // rinkeby: {
    //   provider: rinkebyProvider,
    //   network_id: 4, // eslint-disable-line camelcase
    //   // gasPrice: 476503
    // },
    ganache: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};