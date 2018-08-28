import React, { Component } from 'react';

import Main from "./Main";
import { Web3Consumer } from "../providers/web3";

class App extends Component {

  constructor(props) {
    super(props);

    this.state = { currentAccount: null }
  }

  componentDidMount = async () => {
    const { web3, account } = this.props;

    this.setState({ currentAccount: account })

    if (web3.version.startsWith("1")) {
        console.log("we have web3 version 1.");
        
        web3.currentProvider.publicConfigStore.on('update', ({ selectedAddress }) => {
          
          if (selectedAddress !== this.state.currentAccount) {
            console.log("changing account to " + selectedAddress);
            window.location.reload();
          }
        });
    }
  }

  render() {
    return (
        <Main account={this.props.account}/>
    );
  }
}

export default props => (
  <Web3Consumer>
    {context => context.hasInitialised ? <App {...props} {...context} /> : React.Fragment}
  </Web3Consumer>
);
