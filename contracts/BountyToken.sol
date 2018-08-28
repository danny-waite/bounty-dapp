pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";

/**
 * @title BountyToken
 * @dev The BountyToken contract is an implementation of the ERC20 token standard
 */
contract BountyToken is PausableToken, DetailedERC20 {

    string public constant name = "BountyToken";
    string public constant symbol = "BTK";
    uint8 public constant decimals = 18;

    event NewTokenCreated();

    /**
    * @dev Initialises new token with initial parameters
    */ 
    constructor() DetailedERC20(name, symbol, decimals)
    public 
    {
        totalSupply_ = 20000000000000000000000000;
        balances[msg.sender] = totalSupply_;

        emit NewTokenCreated();
        
    }
}
