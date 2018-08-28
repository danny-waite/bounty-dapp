var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
  console.log("deploying from account " + accounts[0]);

  deployer.deploy(Migrations, 
    // { gas: 4700000, gasPrice: 20000000000 }
  );
};
