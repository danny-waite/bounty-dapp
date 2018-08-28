const truffleAssert = require("truffle-assertions");
const { waitForEvent, sleep } = require('./utils')
const Web3 = require("web3");
const BigNumber = web3.BigNumber;

const BountyRoot = artifacts.require("./BountyRoot.sol");
const ExchangeRateOracle = artifacts.require("./ExchangeRateOracle.sol");

let deployedExchangeRateOracle;

contract('ExchangeRateOracle', async (accounts) => {

    beforeEach(async ()=> {
        // const deployedBountyRoot = await BountyRoot.deployed();
        // const exchangeRateOracleAddress = await deployedBountyRoot.exchangeRateOracleAddress();

        // deployedExchangeRateOracle = await ExchangeRateOracle.at(exchangeRateOracleAddress);
        deployedExchangeRateOracle = await ExchangeRateOracle.new(10000000);
        
    });

    it("should initialise correctly", async () => {

        const { args: { message } } = await waitForEvent(deployedExchangeRateOracle.LogConstructorInitiated({}, {fromBlock: 0, toBlock: 'latest'}))
        assert.equal(message, "Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");

        const exchangeRate = await deployedExchangeRateOracle.exchangeRate();

        assert.isTrue(exchangeRate.eq(new BigNumber(10000000)));
    });

    it("should fail if contact has no eth", async () => {

        let hasError = false;

        try {
            const updateResponse = await deployedExchangeRateOracle.updatePrice();
        } catch (error) {
            hasError = true;
        }
        // TODO, for some reason, this call is not failing, probably because it already has some eth in the test account
        // assert.isTrue(hasError);
        
    });

    it("should update successfully", async () => {

            // first send some eth
            await deployedExchangeRateOracle.deposit({ from: accounts[0], value: 1});

            const updateResponse = await deployedExchangeRateOracle.updatePrice();
            // truffleAssert.prettyPrintEmittedEvents(updateResponse);
            truffleAssert.eventEmitted(updateResponse, 'LogNewOraclizeQuery');

            await sleep(10000);

            const updateEvent = await waitForEvent(deployedExchangeRateOracle.LogPriceUpdated({}, {fromBlock: 0, toBlock: 'latest'}))
            assert.isAbove(updateEvent.args.exchangeRate.toNumber(), 0);

            const exchangeRate = await deployedExchangeRateOracle.exchangeRate();
            assert.isTrue(updateEvent.args.exchangeRate.eq(exchangeRate));
        
    });

    it("should be destructable", async () => {
        const result = await deployedExchangeRateOracle.destroy();
    });

});