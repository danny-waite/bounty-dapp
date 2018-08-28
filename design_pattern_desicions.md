## Upgradability
The Bounty DApp contains 3 contracts, aimed at providing the desired balance between simplicity and upgradabilty.

### BountyRoot
Provides the main interface for the DApp, providing the ability to interact with Bounties and Submissions and provides an interface to other contracts.  Splitting the Bounty/Submission interactions was considered however I felt it was probably overkill for this project and could increase complexity and thus the attack surface.

Contracts that are referenced by BountyRoot have the ability for a new address to be set, thus enabling easy upgradability, restricted to the owner of the contract.

### BountyToken
An ERC20 Token from the `openzeppelin-solidity` library has been used to implement the associated BountyToken (MTK).  This Token makes use of the `PausableToken` intreface so transfers can be paused should any issue be found.

### ExchangeRateOracle
This contract makes use of oraclize to gather the current exchange rate for the MTK token.  Since the function of this contract is simple but the implementation is somewhat complex, it is important that we can upgrade.  Therefore it implements the `Destructible` interface.