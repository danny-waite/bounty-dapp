import React, { createContext, Component } from 'react';
import TruffleContract from "truffle-contract";

import Translations from "../utils/Translations";
import getWeb3 from '../utils/getWeb3';
import { uploadFile } from "../utils/ipfs";

import BountyRootContract from '../../build/contracts/BountyRoot.json'
import BountyTokenContract from '../../build/contracts/BountyToken.json'
import ExchangeRateOracleContract from '../../build/contracts/ExchangeRateOracle.json'

const Web3Context = createContext({
    hasInitialised: false,
    web3: null,
    account: null,
    contractBountyRoot: null,
    contractBountyToken: null,
    contractExchangeRateOracle: null
});

export class Web3Provider extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasInitialised: false,
            web3: null,
            account: null,
            contractBountyRoot: null,
            contractBountyToken: null,
            contractExchangeRateOracle: null
        }

        // this.initialiseWeb3 = this.initialiseWeb3.bind(this);
        // this.getOpenBounties = this.getOpenBounties.bind(this);
        // this.getBounties = this.getBounties.bind(this);
        // this.getPostedBounties = this.getPostedBounties.bind(this);
        // this.getBounty = this.getBounty.bind(this);
        // this.postBounty = this.postBounty.bind(this);
        // this.getBountySubmissionCount = this.getBountySubmissionCount.bind(this);
        // this.getBountySubmission = this.getBountySubmission.bind(this);
        // this.postBountySubmission = this.postBountySubmission.bind(this);
        // this.getBountySubmissions = this.getBountySubmissions.bind(this);
        // this.getBountyEscrow = this.getBountyEscrow.bind(this);
        // this.awardBounty = this.awardBounty.bind(this);
    }

    componentDidMount = async () => {
        await this.initialiseWeb3();

        console.log("web3 instance initialised");
    }

    initialiseWeb3 = async () => {

        console.log("initialising web3 instance...");

        let web3instance = await getWeb3;
        let accounts = await this.getAccounts(web3instance.web3);

        let contractBountyRoot;
        let contractBountyToken;
        let contractExchangeRateOracle;
        
        try {
            const bountyRoot = TruffleContract(BountyRootContract);
            bountyRoot.setProvider(web3instance.web3.currentProvider);
            contractBountyRoot  = await bountyRoot.deployed();
    
            const bountyToken = TruffleContract(BountyTokenContract);
            bountyToken.setProvider(web3instance.web3.currentProvider);
            contractBountyToken = await bountyToken.deployed();

            const exchangeRateOracle = TruffleContract(ExchangeRateOracleContract);
            exchangeRateOracle.setProvider(web3instance.web3.currentProvider);
            const exchangeOracleAddress = await contractBountyRoot.exchangeRateOracleAddress();
            contractExchangeRateOracle  = await exchangeRateOracle.at(exchangeOracleAddress);

        } catch (error) {
           console.error("error creating contract instances", error);
        }

        this.setState({ 
            web3: web3instance.web3, 
            account: accounts[0].toLowerCase(), 
            contractBountyRoot,
            contractBountyToken,
            contractExchangeRateOracle,
            hasInitialised: true 
        });
    }

    getAccounts(web3) {
        return new Promise((resolve, reject) => {
            web3.eth.getAccounts(async (error, accounts) => {
                if (error) reject(error);
                resolve(accounts);
            });
        })
    }

    getBounties = async () => {
        let { contractBountyRoot } = this.state;
        let rawBounties = [];

        const bountyCount = await contractBountyRoot.bountyCount();

        for (let i=0;i<bountyCount.toNumber();i++) {
            const bounty = await contractBountyRoot.bounties(i);
            rawBounties.push(bounty)
        }

        const bounties = Translations.translateBounty(rawBounties);

        return bounties;
    }

    getOpenBounties = async () => {
        const bounties = await this.getBounties();

        return bounties.filter(bounty => bounty.status === "Open");
    }

    getPostedBounties = async (address) => {
        const bounties = await this.getBounties();

        return bounties.filter(bounty => bounty.poster === address);
    }

    getBounty = async (id) => {
        let { contractBountyRoot } = this.state;

        const rawBounty = await contractBountyRoot.bounties(id);
        const bounties = Translations.translateBounty([rawBounty]);
        bounties[0].id = id;
        
        return bounties[0];
    }

    postBounty = async (bounty) => {
        const { account, contractBountyRoot, web3 } = this.state;

        const postTx = await contractBountyRoot.postBounty(
            bounty.title, 
            bounty.description, 
            web3.utils.toWei(bounty.prize),
            Date.parse(bounty.deadline),
            { from: account, value: bounty.escrow ? web3.utils.toWei(bounty.prize, "ether") : null}
        );

        return postTx;
    }

    getBountySubmissionCount = async (bountyId) => {
        const { contractBountyRoot } = this.state;

        const count = await contractBountyRoot.getBountySubmissionCount(bountyId);

        return count.toNumber();
    }

    getBountySubmission = async (bountyId, submissionId) => {
        const { contractBountyRoot } = this.state;

        const rawSubmission = await contractBountyRoot.getBountySubmission(bountyId, submissionId)
        const submissions = Translations.translateBountySubmission([rawSubmission]);

        return submissions[0];
    }

    postBountySubmission = async (bountyId, submission) => {
        const { account, contractBountyRoot } = this.state;
        
        const hash = await uploadFile(submission.fileBuffer);

        const postTx = await contractBountyRoot.postBountySubmission(
            bountyId,
            hash, 
            submission.payTokens,
            { from: account }
        );

        return postTx;
    }

    getBountySubmissions = async (bountyId) => {
        let { contractBountyRoot } = this.state;
        let rawSubmissions = [];

        const submissionCount = await this.getBountySubmissionCount(bountyId);

        for (let i=0;i<submissionCount;i++) {
            const submission = await contractBountyRoot.getBountySubmission(bountyId, i);

            rawSubmissions.push(submission)
        }

        const submissions = Translations.translateBountySubmission(rawSubmissions);

        return submissions;
    }

    getBountySubmissionsForSubmitter = async (submitter) => {
        let { contractBountyRoot } = this.state;
        let submittedBounties = [];

        const bountyCount = await contractBountyRoot.bountyCount();

        for(let b=0;b < bountyCount.toNumber();b++) {
            const submissions = await this.getBountySubmissions(b);

            for(let submission of submissions) {
                if (submission.address == submitter) {
                    const bounty = await this.getBounty(b);

                    submittedBounties.push(bounty);
                }
            }
        }

        return submittedBounties;
    }

    getBountyEscrow = async (bountyId) => {
        const { contractBountyRoot, web3 } = this.state;

        const amount = await contractBountyRoot.bountyBalances(bountyId);

        return web3.utils.fromWei(amount.toNumber().toString(), "ether");
    }

    awardBounty = async (bountyId, submissionId) => {
        const { contractBountyRoot, account, web3 } = this.state;

        const bounty = await this.getBounty(bountyId);
        const valueToPost = bounty.escrow ? web3.utils.toWei(bounty.prize, "ether") : 0;

        const response = await contractBountyRoot.awardBounty(bountyId, submissionId, { from: account, value: valueToPost });
        return response;
    }

    getExchangeRate = async () => {
        const { contractBountyRoot } = this.state;

        const response = await contractBountyRoot.getExchangeRate();
        return response;
    }

    waitForEvent = _event => 
        new Promise((resolve, reject) => 
            _event.watch((err, res) =>
            err ? reject(err) : (resolve(res))));

    render() {
        return (
            <Web3Context.Provider value={{
                ...this.state, 
                getOpenBounties: this.getOpenBounties,
                getBounties: this.getBounties,
                getPostedBounties: this.getPostedBounties,
                getBounty: this.getBounty,
                postBounty: this.postBounty,
                getBountySubmissionCount: this.getBountySubmissionCount,
                getBountySubmission: this.getBountySubmission,
                postBountySubmission: this.postBountySubmission,
                getBountySubmissions: this.getBountySubmissions,
                getBountyEscrow: this.getBountyEscrow,
                awardBounty: this.awardBounty,
                waitForEvent: this.waitForEvent,
                getBountySubmissionsForSubmitter: this.getBountySubmissionsForSubmitter
            }}>
                {this.props.children}
            </Web3Context.Provider>
        );
    }
}

export const Web3Consumer = Web3Context.Consumer;