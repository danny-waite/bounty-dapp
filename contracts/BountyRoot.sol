pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ReentrancyGuard.sol";

import "./BountyToken.sol";
import "./ExchangeRateOracle.sol";

/**
 * @title BountyRoot
 * @dev The BountyRoot contract is the main Bounty contract that manages
 * posts, submissions and interaction with related contacts for Oracles and ERC20 tokens
 */
contract BountyRoot is Pausable, Destructible, ReentrancyGuard {  

    using SafeMath for uint256;
    using SafeMath for uint;

    struct Bounty {
        // uint256 id;
        address poster;
        string title;
        string description;
        uint256 prize;
        BountyStatus status;
        address winner;
        uint deadline;
    }

    struct Submission {
        // uint256 submissionId;
        address submitter;
        string submissionHash;
        bool payTokens;
        // uint256 bountyId;
        // bool approved;
    }

    struct BountySubmissions {
        uint256 nextId;
        mapping(uint256 => Submission) submissions;
    }

    enum BountyStatus { Open, Completed }

    event BountyPosted(uint256 bountyId, uint amount);
    event NewBountyContract();
    event AwardedBounty(uint256 bountyId, uint256 submissionId, bool payTokens, address submitter);
    event PostedBountySubmission(uint256 bountyId, uint256 submissionId, string submissionHash, bool payTokens);
    event SentEtherToWinner(uint256 bountyId, uint256 submissionId, address destination, uint amount);
    event SentTokensToWinner(uint256 bountyId, uint256 submissionId, address destination, uint amount, uint256 tokenAmount, uint exchangeRate);
    event DebugMessage(uint message);
    event SetNewBountyTokenContractAddress(address _address);
    event SetExchangeRateOracleContractAddress(address _address);

    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => BountySubmissions) public bountySubmissions;
    mapping (uint256 => uint) public bountyBalances;

    BountyToken private bountyTokenContract;
    ExchangeRateOracle private exchangeRateOracleContract;

    address public bountyTokenAddress;
    address public exchangeRateOracleAddress;

    uint256 public bountyCount;

    modifier onlyPoster(uint _bountyId) {
        require(msg.sender == bounties[_bountyId].poster);
        _;
    }

    modifier onlyOpen(uint _bountyId) {
        require(bounties[_bountyId].status == BountyStatus.Open);
        _;
    }

    modifier isBeforeDeadline(uint _bountyId) {
        require(now < bounties[_bountyId].deadline);
        _;
    }

    /**
    * @dev Initialises contract
    */
    constructor() public {

        emit NewBountyContract();
    }

    /**
    * @dev sets the associated ERC20 contract enabling issuance of tokens to bounty winners
    * @param _address the address of the MTK token contract
    */
    function setBountyTokenContractAddress(address _address) external onlyOwner nonReentrant {
        bountyTokenAddress = _address;
        bountyTokenContract = BountyToken(_address);

        uint totalSupply = bountyTokenContract.totalSupply();
        bountyTokenContract.approve(this, totalSupply);

        emit SetNewBountyTokenContractAddress(_address);
    }  

    /**
    * @dev sets the associated ExchangeRateOracle contract 
    * @param _address the address of the setExchangeRateOracleAddress contract
    */
    function setExchangeRateOracleAddress(address _address) external onlyOwner {
        exchangeRateOracleAddress = _address;
        exchangeRateOracleContract = ExchangeRateOracle(_address);

        emit SetExchangeRateOracleContractAddress(_address);
    } 

    /**
     * @dev this contract sends ether and interacts with other contracts thus needs some Ether
     */
    function deposit() external payable {
        // do nothing
    }
    event DebugPostBounty(uint _sent, uint _priceWei);
    /**
     * @dev allows anyone to post a bounty
     * posters can send ether with the post, thus putting winnings in escrow making the bounty more desirable
     * @param _title the title for the bounty
     * @param _description the detail describing the bounty
     * @param _prize the amount in ether to be given to the winner
     * @return the id of the bounty
     */
    function postBounty(string _title, string _description, uint _prize, uint _deadline) external payable nonReentrant returns (uint256) {

        require(_prize > 0, "bounty must have a price");
        require(now < _deadline, "bounty must have deadline in the future");

        uint priceWei = _prize.mul(1000000000000000000);

        // if (msg.value > 0) require(msg.value == priceWei);
        emit DebugPostBounty(msg.value, priceWei);

        bountyBalances[bountyCount] = msg.value;

        bounties[bountyCount] = Bounty({
            poster: msg.sender,
            // id: bountyCount,
            title: _title,
            description: _description,
            prize: _prize,
            status: BountyStatus.Open,
            winner: 0,
            deadline: _deadline
        });

        bountySubmissions[bountyCount].nextId = 0;

        emit BountyPosted(bountyCount, msg.value);
        bountyCount++;

        return bountyCount - 1;
    }

    /**
    * @dev returns bounty details
    * @param _bountyId the id of the bounty
    * @return poster, title, description, prize, status, winner
    */
    function getBounty(uint256 _bountyId) public view returns (
        address poster,
        string title,
        string description,
        uint prize,
        BountyStatus status,
        address winner,
        uint deadline
    ) {
        return (
          bounties[_bountyId].poster, 
          bounties[_bountyId].title, 
          bounties[_bountyId].description, 
          bounties[_bountyId].prize, 
          bounties[_bountyId].status, 
          bounties[_bountyId].winner,
          bounties[_bountyId].deadline
        );
    }

    /**
    * @dev post a bounty submission
    * @param _bountyId the Id of the bounty you want to submit against
    * @param _submissionHash the IPFS hash of the submitted code
    * @param _payTokens submitters can choose to be paid in MTK ERC20 tokens
    * @return the id of the submission
     */
    function postBountySubmission(uint256 _bountyId, string _submissionHash, bool _payTokens) public onlyOpen(_bountyId) isBeforeDeadline(_bountyId) returns(uint256) {

        uint256 submissionId = bountySubmissions[_bountyId].nextId;

        bountySubmissions[_bountyId].submissions[submissionId] = Submission({
            submitter: msg.sender,
            submissionHash: _submissionHash,
            payTokens: _payTokens
        });
        bountySubmissions[_bountyId].nextId = submissionId + 1;

        emit PostedBountySubmission(_bountyId, submissionId, _submissionHash, _payTokens);

        return bountySubmissions[_bountyId].nextId - 1;
    }

    /**
     * @dev returns a bounty sumbmission
     * @param _bountyId the id of the bounty
     * @param _submissionId the id of the submission
     * @return submitter, submissionHash, payTokens
     */
    function getBountySubmission(uint256 _bountyId, uint256 _submissionId) public view returns (
        address submitter, 
        string submissionHash, 
        bool payTokens)
    {
        Submission storage submission = bountySubmissions[_bountyId].submissions[_submissionId];
        
        return (
            submission.submitter,
            submission.submissionHash,
            submission.payTokens
        );
    }
    /**
     * @dev returns the sumbmission count for a given bounty
     * @param _bountyId the id of the bounty
     * @return the submission count
     */
    function getBountySubmissionCount(uint256 _bountyId) public view returns (uint256 count) {
        return (bountySubmissions[_bountyId].nextId);
    }

    /**
     * @dev awards the bounty to a submitter, sending ether or tokens depending on the submitters preference
     * @param _bountyId the id of the bounty
     * @param _submissionId the id of the submission
     */
    function awardBounty(uint256 _bountyId, uint256 _submissionId) public payable nonReentrant onlyOpen(_bountyId) onlyPoster(_bountyId) {
        
        Bounty storage bounty = bounties[_bountyId];
        address submitter = bountySubmissions[_bountyId].submissions[_submissionId].submitter;

        bounty.status = BountyStatus.Completed;
        bounty.winner = submitter;

        bountyBalances[_bountyId] = bountyBalances[_bountyId].add(msg.value);

        uint prize = bounty.prize;
        uint currentBalance = bountyBalances[_bountyId];
        uint prizeWei = prize.mul(1000000000000000000);

        //TOD: ensure enough eth has been sent
        // require(currentBalance == prizeWei, "eth balance should equal the prize");
  
        bool payTokens = bountySubmissions[_bountyId].submissions[_submissionId].payTokens;
        
        if (payTokens) {

            uint exchangeRate = exchangeRateOracleContract.exchangeRate();
            uint256 tokenAmount = exchangeRate.mul(bounty.prize);
        
            bountyBalances[_bountyId] = 0;
            bountyTokenContract.transferFrom(this, submitter, tokenAmount);
            emit SentTokensToWinner(_bountyId, _submissionId, submitter, bounty.prize, tokenAmount, exchangeRate);

        } else {
        
            bountyBalances[_bountyId] = 0;
            submitter.transfer(bounty.prize);
            emit SentEtherToWinner(_bountyId, _submissionId, submitter, bounty.prize);
        }

        emit AwardedBounty(_bountyId, _submissionId, payTokens, submitter) ;
    }

    /**
     * @dev utility function to send tokens
     * @param _to the destination address
     * @param _amount the amount of tokens
     */
    function sendTokens(address _to, uint _amount) public onlyOwner nonReentrant {
        bountyTokenContract.transferFrom(this, _to, _amount);
    }

    /**
     * @dev get the current exchange rate from oracle
     */
    function getExchangeRate() public view returns (uint) {
        return exchangeRateOracleContract.exchangeRate();
    }
}
