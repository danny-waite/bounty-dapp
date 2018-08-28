var BountyRoot = artifacts.require("./BountyRoot.sol");
var BountyToken = artifacts.require("./BountyToken.sol");
var ExchangeRateOracle = artifacts.require("./ExchangeRateOracle.sol");

module.exports = async (deployer, network, accounts) => {

  deployer.deploy(BountyRoot).then(async () => {

    await deployer.deploy(BountyToken);
    await deployer.deploy(ExchangeRateOracle, 10000000); 

    const deployedBountyRoot = await BountyRoot.at(BountyRoot.address);
    const deployedBountyToken = await BountyToken.at(BountyToken.address);
    const deployedExchangeRateOracle = await ExchangeRateOracle.at(ExchangeRateOracle.address);
  
    await deployedBountyRoot.setBountyTokenContractAddress(deployedBountyToken.address);
    await deployedBountyRoot.setExchangeRateOracleAddress(deployedExchangeRateOracle.address);
    
    await deployedBountyRoot.deposit({ from: accounts[0], value: 1});
    await deployedBountyToken.transfer(deployedBountyRoot.address, 10000000000000000000000000);

  });

};
