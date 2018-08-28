# Bounty DApp
This project is intended to demonstrate current capabilities when building DApp's on Ethereum using Solidity.

## Functionality

### As a bounty poster I can
* Create a bounty with a title, description and prize
* Choose to escrow the prize providing increased confidence in my bounty
* See my posted bounties
* Choose a winner after the finish date

### As a bounty submitter I can
* Choose any open bounty to submit an entry
* Upload a work package and notes
* Choose to receive Ether or MTK tokens should I win

### Other features
* a Contract page to provide various insights into contract data
* an Account page to show metrics from the current account

## Technical
The following describes the technical capabilities of the DApp.
* `BountyRoot` is the main contract and provides:
  * interaction with bounties and submissions
  * links to `BountyToken` for ERC20 token capabilities
  * links to `ExchangeRateOracle` to get current price of ETH/MTK pair
* `BountyToken` uses the `openzeppelin-solidity` library, specifically `StandardToken` and `DetailedERC20` to provide the designed token capabilities
* `ExchangeRateOracle` uses `oraclize` to provide access to external data, in this case the Binance Exchange API.  Since BTK is a fictitious token, I've used REPETH to simulate.

### Other technical details
* IPFS is used to store the submitted work and the hash is stored on-chain.

## Networks
The contacts have been deployed to Rinkeby with the contract addresses contained in the `deployed_addresses.txt` file.  You can choose to test with the built in Truffle TestRPC server or using Ganache.  You'll need 2 test accounts on whichever network you use.

## Setup
1. `git clone https://github.com/danny-waite/bounty-dapp.git`
2. `yarn install` or `npm install`
3. ensure you have truffle installed globally with `npm install -g truffle` 
4. run `truffle migrate --network ganache` or `truffle develop` depending on which network you choose.
5. in a new terminal run `npm run bridge-ganache` or `npm run bridge-truffle`, this allows us to test the oracle contract locally. You will likely need to replace Line 30 of `ExchangeRateOracle.sol` with the line given when the bridge has initialised.
6. `npm start` this will start the react development web server and should open your browser to http://localhost:3000 you can also use the app at http://128.1.78.11/

## Testing
You'll need to ensure you have Metamask installed, I recommend using the latest version which provide web3 1.0 as this supports UI refresh when you switch accounts in Metamask.

1. Goto Create Bounty and enter details about your bounty.  If you enable escrow, the prize will be sent with the transaction and stored in the smart contract.
2. After the bounty has been mined, click Posted Bounties to see the bounty.
3. Switch to your second account in Metamask
4. Click Home to see active bounties and choose the bounty you previously created.
5. You should see the Submit Entry button, click it.
6. Enter notes, choose a file to upload and choose whether you want to pay in MTK tokens and click Submit.
7. Once the submission has been mined, click Submitted Bounties to ensure its listed.
8. Switch back to your first account
9. Goto the created bounty, you should see an Award button at the side of the submission.
10. Check to see the status of the bounty is now `Completed`.
11. You can verify the account balances using the `Account` link at the top right.
12. Repeat the process choosing not to escrow and to receive Ether instead of MTK tokens.

### Other functionality
* Contact screen
  * Emergency Stop
  * Send tokens from contract to specified address (admin function)
  * See various data from contract including events

## Unit Tests
You can run the unit tests with `truffle test --network ganache` or `truffle test`

## Notes
* The `ExchangeRateOracleTests` sometimes fail, this is likely due to the oracle bridge not responding in time.
* I have managed to publish the site using a docker container, since the build process in the react truffle box is broken annoyingly and I only found this out when I came to deploy
* You may need to reset the Metamask account if you are getting nonce errors