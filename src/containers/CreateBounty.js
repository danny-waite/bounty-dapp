import React, { Component } from 'react';
import { Web3Consumer } from "../providers/web3";

import { Button, Form, Input, TextArea, Message, Checkbox, Loader, Grid } from 'semantic-ui-react'

class CreateBounty extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: null,
            statusMessage: null,
            receipt: null,
            escrow: true,
            deadline: null,
            showLoader: false
        }
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value });
    handleToggle = () => this.setState({ escrow: !this.state.escrow })
    handleSubmit = async (e) => {
        e.preventDefault();

        const { contractBountyRoot, waitForEvent } = this.props;

        this.setState({ showLoader: true });

        let posted = false;
        let postResult;
        
        try {
            postResult = await this.props.postBounty(this.state);
            this.setState({ receipt: postResult.receipt, showLoader: false });
            console.log(postResult);
            posted = true;
        } catch(ex) {
            this.setState({ showLoader: false });
        }

        if (posted) {
            this.setState({ statusMessage: "waiting for block " + postResult.receipt.blockNumber });

            const postedEvent = await waitForEvent(contractBountyRoot.BountyPosted({}, { fromBlock: postResult.receipt.blockNumber -1, toBlock: 'latest' }));

            this.setState({ statusMessage: "Bounty was successfully mined." });
        }

        // await setTimeout(() => {
        //     this.props.history.push("/posted")
        // }, 4000); 
        
    }

    render() {
        const { errorMessage, statusMessage, receipt } = this.state;

        return (
            <Form size="huge" onSubmit={this.handleSubmit} error={errorMessage != null} success={receipt !=null}>
                <Form.Group widths='equal'>
                    <Form.Field name='title' control={Input} label='Title' placeholder='Title' onChange={this.handleChange}/>
                    <Form.Field name='prize' control={Input} label='Prize' placeholder='Prize' onChange={this.handleChange}/>
                    <Form.Field name='deadline' control={Input} label='Deadline' placeholder='MM/DD/YYYY' onChange={this.handleChange}/>
                    <Form.Field name='escrow' control={Checkbox} label='Escrow' onChange={this.handleToggle } checked={this.state.escrow}/>
                </Form.Group>
                <Form.Group widths='equal'>
                    <Form.Field name='description' control={TextArea} label='Description' onChange={this.handleChange}/>
                </Form.Group>
                <Grid columns={3}>
                    <Grid.Row>
                        <Grid.Column floated='left'>
                            <Form.Field control={Button}>Create</Form.Field>
                        </Grid.Column>
                        <Grid.Column floated='right'>
                            <Loader inline size='small' active={this.state.showLoader}>Creating Bounty</Loader>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Message
                    error
                    header='Unable to Post Bounty'
                    content={errorMessage}
                />
                <Message
                    success
                    header='Successfully Posted Bounty'
                    content={ receipt && 
                        <div>
                            <h4>Tx Hash: {receipt.transactionHash}</h4>
                        </div>
                    }
                />
                <h3>{statusMessage}</h3>
            </Form>
        );
    }
}

export default props => (
    <Web3Consumer>
      {context => context.hasInitialised ? <CreateBounty {...props} {...context} /> : React.Fragment}
    </Web3Consumer>
  );