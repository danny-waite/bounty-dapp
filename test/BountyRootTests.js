const truffleAssert = require("truffle-assertions");
const utils = require("./utils");
const Web3 = require("web3");
const BigNumber = web3.BigNumber;
const moment = require("moment")

require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber));

const BountyRoot = artifacts.require("./BountyRoot.sol");
const BountyToken = artifacts.require("./BountyToken.sol");
const ExchangeRateOracle = artifacts.require("./ExchangeRateOracle.sol");

let deployedBountyRoot;
let deployedBountyToken;
let deployedExchangeRateOracle;

contract('BountyRoot', async (accounts) => {

  beforeEach(async ()=> {

    deployedBountyRoot = await BountyRoot.new();
    deployedBountyToken = await BountyToken.new();
    deployedExchangeRateOracle = await ExchangeRateOracle.new(10000000);

    await deployedBountyRoot.setBountyTokenContractAddress(deployedBountyToken.address);
    await deployedBountyRoot.setExchangeRateOracleAddress(deployedExchangeRateOracle.address);

    await deployedBountyRoot.deposit({ from: accounts[0], value: 1});
    await deployedBountyToken.transfer(deployedBountyRoot.address, 10000000000000000000000000);

  });

  it("should initialise correctly", async () => {
    
    assert.isObject(deployedBountyRoot);

    assert.equal(await deployedBountyRoot.bountyCount(), 0);
    assert.equal((await deployedBountyRoot.bountyTokenAddress()).length, 42);
    assert.isAbove((await deployedBountyRoot.contract._eth.getBalance(deployedBountyRoot.address)).toNumber(), 0);

  });

  it("should successfully post Bounty", async() => {

    const title = "test_title";
    const description = "test_description";
    const prize = 2;
    const deadline = moment().add(1, 'days').unix();

    const postResult = await deployedBountyRoot.postBounty(title, description, prize, deadline);
    const bountyId = (await deployedBountyRoot.bountyCount()) - 1;

    truffleAssert.eventEmitted(postResult, 'BountyPosted', (ev) => {
      return ev.bountyId.toNumber() === bountyId;
    });

    const getResult = await deployedBountyRoot.getBounty(bountyId);

    assert.equal(getResult[0], accounts[0]);
    assert.equal(getResult[1], title);
    assert.equal(getResult[2], description);
    assert.equal(getResult[3].toNumber(), prize);
    assert.equal(Web3.utils.hexToNumber(getResult[4]), 0);

  });

  it("should successfully post Bounty Submission", async() => {

    const submissionId = 0;
    const submissionHash = "test";
    const payTokens = true;
    const deadline = moment().add(1, 'days').unix();

    const postBountyResult = await deployedBountyRoot.postBounty("title", "desc", 1, deadline);
    const bountyId = (await deployedBountyRoot.bountyCount()) - 1;

    const postSubmissionResult = await deployedBountyRoot.postBountySubmission(bountyId, submissionHash, payTokens, { from: accounts[3] });

    truffleAssert.eventEmitted(postSubmissionResult, 'PostedBountySubmission', (ev) => {
      return (
        ev.bountyId.eq(bountyId) && 
        ev.submissionId.eq(submissionId) && 
        ev.submissionHash === submissionHash && 
        ev.payTokens === payTokens
      );
    });

    const getSubmissionResult = await deployedBountyRoot.getBountySubmission(bountyId, 0);

    assert.equal(getSubmissionResult[0], accounts[3]);
    assert.equal(getSubmissionResult[1], submissionHash);
    assert.equal(getSubmissionResult[2], payTokens);

  });

  it("should successfully award Bounty pay with Ether", async() => {
    const submissionId = 0;
    const payTokens = false;
    const amount = new BigNumber(1);
    const deadline = moment().add(1, 'days').unix();
    const poster = accounts[3];
    const submitter = accounts[9];

    const beforeBalance = await deployedBountyRoot.contract._eth.getBalance(accounts[9]);

    const postBountyResult = await deployedBountyRoot.postBounty("title", "desc", amount, deadline, { from: poster, value: Web3.utils.toWei(amount.toString(), "ether") });
    const bountyId = (await deployedBountyRoot.bountyCount()) - 1;
    
    const postSubmissionResult = await deployedBountyRoot.postBountySubmission(bountyId, "test", payTokens, { from: submitter });
    const awardBountyResult = await deployedBountyRoot.awardBounty(bountyId, submissionId, { from: poster });

    // truffleAssert.prettyPrintEmittedEvents(awardBountyResult);

    truffleAssert.eventEmitted(awardBountyResult, 'AwardedBounty', (ev) => {
      return (
        ev.bountyId.eq(bountyId) && 
        ev.submissionId.eq(submissionId) && 
        ev.payTokens === payTokens
      );
    });

    truffleAssert.eventEmitted(awardBountyResult, 'SentEtherToWinner', (ev) => {
      return (
        ev.bountyId.eq(bountyId) && 
        ev.submissionId.eq(submissionId) && 
        ev.destination === submitter &&
        ev.amount.eq(amount)
      );
    });
    
    const beforeEther = utils.toEther(beforeBalance);
    const currentBalance = await deployedBountyRoot.contract._eth.getBalance(accounts[9]);
    const currentEther = utils.toEther(currentBalance);

    //TODO: confirm balance
    // assert.equal(currentBalance, (beforeBalance + utils.toWei(amount)) - postSubmissionResult.receipt.gasUsed);
    
    const bounty = await deployedBountyRoot.bounties(bountyId);

    assert.equal(bounty[4].toString(), "1"); // status Completed
    assert.equal(bounty[5], submitter); // winner

  });

  it("should successfully award Bounty pay with Tokens", async() => {
    const submissionId = 0;
    const payTokens = true;
    const amount = new BigNumber(2);
    const exchangeRate = new BigNumber(10000000);
    const deadline = moment().add(1, 'days').unix();
    const poster = accounts[3];
    const submitter = accounts[9];

    const postBountyResult = await deployedBountyRoot.postBounty("title", "desc", amount, deadline, { from: poster, value: Web3.utils.toWei(amount.toString(), "ether") });
    const bountyId = (await deployedBountyRoot.bountyCount()) - 1;
    
    const postSubmissionResult = await deployedBountyRoot.postBountySubmission(bountyId, "test", payTokens, { from: submitter });
    
    const beforeTokens = await deployedBountyToken.balanceOf(submitter);
    
    const awardBountyResult = await deployedBountyRoot.awardBounty(bountyId, submissionId, { from: poster });

    // truffleAssert.prettyPrintEmittedEvents(awardBountyResult);

    truffleAssert.eventEmitted(awardBountyResult, 'AwardedBounty', (ev) => {
      return (
        ev.bountyId.eq(bountyId) && 
        ev.submissionId.eq(submissionId) && 
        ev.payTokens === payTokens
      );
    });

    truffleAssert.eventEmitted(awardBountyResult, 'SentTokensToWinner', (ev) => {
      return (
        ev.bountyId.eq(bountyId) && 
        ev.submissionId.eq(submissionId) && 
        ev.destination === submitter &&
        ev.amount.eq(amount)
      );
    });
    
    const afterTokens = await deployedBountyToken.balanceOf(submitter);
    const expectedTokenTotal = beforeTokens.plus(amount).times(exchangeRate);

    assert.isTrue(afterTokens.eq(expectedTokenTotal), "token balance check");
    // assert.equal(afterTokens, expectedTokenTotal);

    const bounty = await deployedBountyRoot.bounties(bountyId);

    assert.equal(bounty[4].toString(), "1"); // status Completed
    assert.equal(bounty[5], submitter); // winner

  });

  it("should have ownable capability", async () => {
    assert.equal((await deployedBountyRoot.owner()), accounts[0]);
  });

  it("should not allow post bounty in the past", async () => {
    const poster = accounts[3];
    const amount = new BigNumber(2);
    const deadline = moment().subtract(1, 'days').unix();

    await utils.assertFail(async () => (
      deployedBountyRoot.postBounty("title", "desc", amount, deadline, { from: poster, value: Web3.utils.toWei(amount.toString(), "ether") })
    ));    
  });

  it("cannot submit after deadline", async () => {
    const poster = accounts[3];
    const submitter = accounts[9];
    const amount = new BigNumber(2);
    const deadline = moment().add(1, 'days').unix();

    const postResult = await deployedBountyRoot.postBounty("title", "desc", amount, deadline, { from: poster, value: Web3.utils.toWei(amount.toString(), "ether") });
    const bountyId = (await deployedBountyRoot.bountyCount()) - 1;
    const postSubmissionResult = await deployedBountyRoot.postBountySubmission(bountyId, "test", false, { from: submitter });
    const awardBountyResult = await deployedBountyRoot.awardBounty(bountyId, 0, { from: poster });

    await utils.assertFail(async () => (
      deployedBountyRoot.postBountySubmission(bountyId, "test", false, { from: submitter })
    ));  
  
  });

  it("cannot double post winner", async () => {
    const poster = accounts[3];
    const submitter = accounts[9];
    const amount = new BigNumber(2);
    const deadline = moment().add(1, 'days').unix();

    const postResult = await deployedBountyRoot.postBounty("title", "desc", amount, deadline, { from: poster, value: Web3.utils.toWei(amount.toString(), "ether") });
    const bountyId = (await deployedBountyRoot.bountyCount()) - 1;
    const postSubmissionResult = await deployedBountyRoot.postBountySubmission(bountyId, "test", false, { from: submitter });
    const awardBountyResult = await deployedBountyRoot.awardBounty(bountyId, 0, { from: poster });

    await utils.assertFail(async () => (
      deployedBountyRoot.awardBounty(bountyId, 0, { from: poster })
    ));  
  
  });

});
