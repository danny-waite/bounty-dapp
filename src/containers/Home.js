import React, { Component } from 'react';
import { Web3Consumer } from "../providers/web3";
import { ActiveBountyList } from "../components/ActiveBountyList";

import getWeb3 from '../utils/getWeb3';

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            bounties: null
        }
    }

    async componentDidMount() {
        const { account, getOpenBounties } = this.props;
        
        const bounties = await getOpenBounties();

        this.setState({ bounties });
    }

    getAccounts = (web3) => {
        return new Promise((resolve, reject) => {
            web3.eth.getAccounts(async (error, accounts) => {
                if (error) reject(error);
                resolve(accounts);
            });
        })
    }

    render() {
        return (this.state.bounties && <ActiveBountyList data={this.state.bounties} />)
    }
}

export default props => (
    <Web3Consumer>
      {context => context.hasInitialised ? <Home {...props} {...context} /> : <div>loading...</div>}
    </Web3Consumer>
  );
