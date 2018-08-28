import React, { Component } from 'react';
import { Web3Consumer } from "../providers/web3";
import { ActiveBountyList } from "../components/ActiveBountyList";

class Submitted extends Component {

    constructor(props) {
        super(props);
        this.state = {
            bounties: null
        }
    }

    async componentDidMount() {
        const { account, getBountySubmissionsForSubmitter } = this.props;

        const bounties = await getBountySubmissionsForSubmitter(account);

        this.setState({ bounties });
    }

    render() {
        return (this.state.bounties && <ActiveBountyList data={this.state.bounties} />)
    }
}

export default props => (
    <Web3Consumer>
      {context => context.hasInitialised ? <Submitted {...props} {...context} /> : <div>loading...</div>}
    </Web3Consumer>
);
