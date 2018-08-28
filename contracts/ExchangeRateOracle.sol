pragma solidity ^0.4.24;

import "./oraclize/usingOraclize.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";

/**
 * @title ExchangeRateOracle
 * @dev The ExchangeRateOracle contract provides the current exchange rate from Ether to MTK
 */
contract ExchangeRateOracle is usingOraclize, Destructible {

    using SafeMath for uint256;
    using SafeMath for uint;

    uint public exchangeRate;
    bytes32 public oraclizeId;

    event LogConstructorInitiated(string message);
    event LogPriceUpdated(uint exchangeRate);
    event LogNewOraclizeQuery(string description);


    function deposit() external payable {
        // do nothing
    }

    /**
    * @dev Initialises new oracle with the initial exchange rate and the Oracle Address Resolver for debugging
    */ 
    constructor(uint _initialExchangeRate) public {
        exchangeRate = _initialExchangeRate;
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);

        // updatePrice();

        emit LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
    }

    /**
    * @dev the callback function is called when the oracle provides the requested information
    * @param id the id for the specific update request
    * @param result the result of the query
    */ 
    function __callback(bytes32 id, string result) public {
        if (msg.sender != oraclize_cbAddress()) revert();
        exchangeRate = parseInt(result, 8);
        emit LogPriceUpdated(exchangeRate);
    }

    /**
     * @dev initialised an price update
     */
    function updatePrice() public payable {
        // if (oraclize_getPrice("URL") > this.balance) {
        //     emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        // } else {
            emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", "json(https://api.binance.com/api/v3/ticker/price?symbol=REPETH).price");
        // }
    }
}