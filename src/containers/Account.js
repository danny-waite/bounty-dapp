import React, { Component } from 'react';
import { Card, Icon } from 'semantic-ui-react';
import { Web3Consumer } from "../providers/web3";

class Account extends Component {

    constructor(props) {
        super(props);

        this.state = {
            account: null,
            ethAmount: null,
            tokenAmount: 0
        }
    }

    async componentDidMount() {
        const { web3, account, contractBountyRoot, contractBountyToken } = this.props;

        this.setState({ account });

        const weiAmount = await web3.eth.getBalance(account);
        const ethAmount = web3.utils.fromWei(weiAmount.toString(), "ether");
        this.setState({ ethAmount });

        const tokenBalance = await contractBountyToken.balanceOf(account);
        const tokenAmount = tokenBalance.toNumber();
        this.setState({ tokenAmount });
    }

    render() {
        const { account, ethAmount, tokenAmount } = this.state;

        return (
            <div>
                <Card.Group>
                    <Card>
                        <Card.Content>
                            <Icon name='ethereum' size='large' />
                            <Card.Header>{ethAmount}</Card.Header>
                            <Card.Meta>ETH</Card.Meta>
                        </Card.Content>
                    </Card>
                    <Card>
                        <Card.Content>
                            <Icon name='ticket' size='large' />
                            <Card.Header>{tokenAmount}</Card.Header>
                            <Card.Meta>BTK</Card.Meta>
                        </Card.Content>
                    </Card>
                </Card.Group>
            </div>
        );
    }
}

export default props => (
    <Web3Consumer>
      {context => context.hasInitialised ? <Account {...props} {...context} /> : React.Fragment}
    </Web3Consumer>
  );