import React, { Component } from 'react';
import { Web3Consumer } from "../providers/web3";
import { ActiveBountyList } from "../components/ActiveBountyList";

class Posted extends Component {

    constructor(props) {
        super(props);
        this.state = {
            bounties: null
        }
    }

    async componentDidMount() {
        const { account, getPostedBounties } = this.props;

        const bounties = await getPostedBounties(account);

        this.setState({ bounties });
    }

    render() {
        return (this.state.bounties && <ActiveBountyList data={this.state.bounties} />)
    }
}

export default props => (
    <Web3Consumer>
      {context => context.hasInitialised ? <Posted {...props} {...context} /> : <div>loading...</div>}
    </Web3Consumer>
  );