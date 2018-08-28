import React, { Component } from 'react';
import { List, Statistic, Divider, Button } from 'semantic-ui-react'
import { Web3Consumer } from "../providers/web3";

import TruffleContract from "truffle-contract";
// import BountyRootContract from '../../build/contracts/BountyRoot.json'
// import BountyTokenContract from '../../build/contracts/BountyToken.json';
// import ExchangeRateOracle from '../../build/contracts/ExchangeRateOracle.json';

import { TransferTokensModal } from "../components/TransferTokensModal";

const EventList = ({events, title}) => (
    <div>
        <h1>{title}</h1>
        {events.length == 0 && <h4>no events</h4>}
        <List divided relaxed>
        {events.map((event, index) =>
            <List.Item key={index}>
                <List.Icon name='play' size='large' verticalAlign='middle' />
                <List.Content>
                    <List.Header as='a'>{event.event}</List.Header>
                    <List.Description as='a'>{JSON.stringify(event.args)}</List.Description>
                </List.Content>
            </List.Item>
        )}
        </List>
    </div>
  )

class Contract extends Component {

    constructor(props) {
        super(props);

        this.state = {
            statusMessage: null,
            bountyEvents: [],
            tokenEvents: [],
            oracleEvents: [],
            addressBounty: null,
            addressToken: null,
            tokenAmount: 0,
            exchangeRate: 0,
            paused: false,
            owner: null
        }
    }

    async componentDidMount() {
        const { web3, account, contractBountyToken, contractBountyRoot, contractExchangeRateOracle } = this.props;
        const { bountyEvents, tokenEvents, oracleEvents } = this.state;

        if (contractBountyRoot && contractBountyToken && contractExchangeRateOracle) {

            const addressToken = await contractBountyRoot.bountyTokenAddress();
            this.setState({ addressToken });

            const addressBounty = contractBountyRoot.address;
            this.setState({ addressBounty });
            
            const addressOracle = contractExchangeRateOracle.address;
            this.setState({ addressOracle });

            const paused = await contractBountyRoot.paused();
            this.setState({ paused });

            try {
                const tokenBalance = await contractBountyToken.balanceOf(addressBounty);
                const tokenAmount = tokenBalance.toNumber();
                this.setState({ tokenAmount });
            } catch (error) { }

            contractBountyRoot.allEvents({ fromBlock: 0, toBlock: 'latest' }).watch((error, result) => {
                tokenEvents.push(result);
                this.setState({ tokenEvents });
            });

            contractBountyToken.allEvents({ fromBlock: 0, toBlock: 'latest' }).watch((error, result) => {
                bountyEvents.push(result);
                this.setState({ bountyEvents });
            });

            contractExchangeRateOracle.allEvents({ fromBlock: 0, toBlock: 'latest' }).watch((error, result) => {
                oracleEvents.push(result);
                this.setState({ oracleEvents });
            });
        }

        const exchangeRate = await contractBountyRoot.getExchangeRate();
        this.setState({ exchangeRate: exchangeRate.toNumber() });

        const owner = await contractBountyRoot.owner();
        this.setState({ owner });


    }

    transferTokens = async ({ amount, address }) => {
        const { account, contractBountyRoot } = this.props;

        const res = await contractBountyRoot.sendTokens(address, amount, { from: account });
        console.log("res", res);
    }

    emergencyStop = async () => {
        const { contractBountyRoot, account } = this.props;
        const { paused } = this.state;

        if (paused) {
            await contractBountyRoot.unpause({ from: account });
            this.setState({ paused: false, statusMessage: "Bounty contract has been unpaused." });
        } else {
            await contractBountyRoot.pause({ from: account });
            this.setState({ paused: true, statusMessage: "Bounty contract has been paused." });
        }
    }

    render() {
        const { 
            statusMessage,
            tokenEvents, 
            bountyEvents, 
            oracleEvents,
            tokenAmount, 
            addressToken, 
            addressBounty,
            addressOracle,
            exchangeRate,
            paused,
            owner
        } = this.state;

        

        return (
            <div>
                <EventList title="Bounty Events" events={tokenEvents} />
                <EventList title="Token Events" events={bountyEvents} />
                <EventList title="Oracle Events" events={oracleEvents} />
                <h2>Bounty Contract Address</h2>
                <h3>{addressBounty}</h3>
                <h2>Token Contract Address</h2>
                <h3>{addressToken}</h3>
                <h2>Oracle Contract Address</h2>
                <h3>{addressOracle}</h3>
                <h2>Contract Owner</h2>
                <h3>{owner}</h3>
                <Divider/>
                <Statistic.Group size='tiny'>
                    <Statistic>
                        <Statistic.Value>{tokenAmount}</Statistic.Value>
                        <Statistic.Label>Token Balance</Statistic.Label>
                    </Statistic>
                    <Statistic>
                        <Statistic.Value>{exchangeRate}</Statistic.Value>
                        <Statistic.Label>Exchange Rate</Statistic.Label>
                    </Statistic>
                    <Statistic>
                        <Statistic.Value>{paused ? "Paused" : "Active"}</Statistic.Value>
                        <Statistic.Label>Contract State</Statistic.Label>
                    </Statistic>
                </Statistic.Group>
                <Divider/>
                <TransferTokensModal onSubmit={this.transferTokens}/>
                <Button onClick={this.emergencyStop}>Toggle Emergency Stop</Button>
                <h3>{statusMessage}</h3>
            </div>
        );
    }
}

export default props => (
    <Web3Consumer>
      {context => context.hasInitialised ? <Contract {...props} {...context} /> : React.Fragment}
    </Web3Consumer>
  );