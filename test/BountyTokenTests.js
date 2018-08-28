const truffleAssert = require("truffle-assertions");
const { waitForEvent, sleep, assertFail, assertSuccess } = require('./utils')
const Web3 = require("web3");
const BigNumber = web3.BigNumber;

const BountyToken = artifacts.require("./BountyToken.sol");

let deployedBountyToken;

contract('BountyTokenTests', async (accounts) => {

    beforeEach(async ()=> {
        deployedBountyToken = await BountyToken.new();
        
    });

    it("should initialise correctly", async () => {

        const newTokenCreatedEvent = await waitForEvent(deployedBountyToken.NewTokenCreated({}, { fromBlock: 0, toBlock: 'latest' }))
        assert.equal(newTokenCreatedEvent.event, "NewTokenCreated");
        assert.equal((await deployedBountyToken.name()), "BountyToken");
        assert.equal((await deployedBountyToken.symbol()), "BTK");
        assert.equal((await deployedBountyToken.decimals()), 18);
        assert.equal((await deployedBountyToken.totalSupply()), 20000000000000000000000000);
    });

    it("should be able to transfer tokens", async () => {

        await assertSuccess(async () => (
            deployedBountyToken.transfer(accounts[4], 50000)
        ));

    });

    it("should be fail to transfer if balance is too low", async () => {
        
        await assertFail(async () => (
            deployedBountyToken.transfer(accounts[5], 200000000000000000000000001)
        ));  
    
    });

    it("should have ownable capability", async () => {
        assert.equal((await deployedBountyToken.owner()), accounts[0]);
    });

    it("should be able to transfer ownership", async () => {
        const result = await deployedBountyToken.transferOwnership(accounts[1]);

        const owner = await deployedBountyToken.owner();
        assert.equal(owner, accounts[1]);
    });

    it("should be pausible", async () => {
        const result = await deployedBountyToken.pause();

        const paused = await deployedBountyToken.paused();
        assert.isTrue(paused);

    });


});