## Reentrancy
I've implemented `ReentrancyGuard` and the `nonReentrant` modifier to prevent again this in functions that deal with transfer of Ether or MTK Tokens.  Also ensuring relevent state changes happen before external contract calls.

## Emergency Stop
I've implemented the following interfaces from `openzeppelin-solidity` to cover this
* `Pausible` in `BountyRoot`
* `Destructible` in `ExchangeRateOracle`
* `PausableToken` in `BountyToken`

## Logic
* Various modifiers on functions to ensure the correct state before entering such as `onlyPoster` `onlyOpen` `isBeforeDeadline`
* Unit tests to ensure various protections are enforced
* Simplified contract use as much as possible

## Overflow
SafeMath from `openzeppelin-solidity` has been used to protect against overflow/underflow attacks.

## Access
Access to relevant functions are restricted to their intended usage, for example `onlyOwner`

## Upgradability
If a vulnerability is found in `BountyToken` or `ExchangeRateOracle` new versions of these contracts can be deployed and references changed by the `BountyRoot` owner.  If an issue is detected in `BountyRoot` this contract is both `Pausable` and `Destructible` thus can be controlled and recreated if need be.

## Use of transfer
I'm using `transfer` to send Ether to the winner of the bounty, which is safer and will revert the transaction if neccessary.

## Timestamps
Although timestamps are used, they are an extra measure and security does not depend on them.

## No fallback payable function
The `deposit` function is used to send Ether to the contract as payable fallback functions are discouraged.

## Oyente Project
I attempted to use the Oyente Project to analyse for some known attacks in the solidity code, however it seems to have issues with the version of Solidity I'm using.  You can see an example of how I used this in the `docker-compose.yml` file.  That's a shame, promising project. 
