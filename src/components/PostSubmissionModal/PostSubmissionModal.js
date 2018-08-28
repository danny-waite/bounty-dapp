import React, { Component } from 'react';
import { Button, Modal, Icon, Form, Input, Checkbox, File, Grid } from 'semantic-ui-react'
import { Web3Consumer } from "../../providers/web3";

class PostSubmissionModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: null,
            receipt: null,
            modalOpen: false,
            payTokens: true
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
    handleClose = () => this.setState({ modalOpen: false })
    handleChange = (e, { name, value }) => this.setState({ [name]: value });
    handleToggle = () => this.setState({ payTokens: !this.state.payTokens })
    handleSubmit = async (e) => {

        const { contractBountyRoot, waitForEvent, refreshSubmissions } = this.props;
        const { fileBuffer } = this.state;

        if (!fileBuffer){
            this.setState({ statusMessage: "you must upload a file"});
            return;
        }

        let submitted = false;
        let submitResult;

        this.setState({ statusMessage: "submitting entry..." });

        try {
            submitResult = await this.props.onSubmit(this.state);
            console.log(submitResult);

            this.setState({ statusMessage: "successfully submitted entry" });
            submitted = true;

        } catch (error) {
            this.setState({ statusMessage: "error posting submission: " + error});
            console.log(error);
        }

        if (submitted) {
            this.setState({ statusMessage: "waiting for block " + submitResult.receipt.blockNumber });

            const postedEvent = await waitForEvent(contractBountyRoot.PostedBountySubmission({}, { fromBlock: submitResult.receipt.blockNumber -1, toBlock: 'latest' }));

            await this.sleep(4000);

            refreshSubmissions();

            this.setState({ modalOpen: false });
        }
        

    }

    sleep = (time) => {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    handleFileChange = (event) => {
        event.preventDefault()
        const file = event.target.files[0]
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => {
          this.setState({ fileBuffer: Buffer(reader.result) })
        }
    }

    render() {
        const { title, buttonText, showButton } = this.props;
        const { modalOpen, errorMessage, receipt, statusMessage, showLoader } = this.state;

        return (
            showButton &&
            <Modal 
                trigger={<Button onClick={this.handleOpen}>{buttonText}</Button>}
                open={modalOpen}
                onClose={this.handleClose}
            >
                <Modal.Header>{title}</Modal.Header>
                <Modal.Content>
                        <Form size="huge" onSubmit={this.handleSubmit} error={errorMessage != null} success={receipt !=null}>
                        <Form.Group widths='equal'>
                            <Form.Field name='notes' control={Input} label='Notes' placeholder='Notes' onChange={this.handleChange}/>
                            <Form.Field name='payTokens' control={Checkbox} label='Pay in MTK Tokens' onChange={this.handleToggle } checked={this.state.payTokens}/>
                            <Form.Input name={name} onChange={this.handleFileChange} type="file"/>
                        </Form.Group>
                    </Form>
                </Modal.Content>
                <Modal.Actions style={{backgroundColor: "grey"}}>
                    <Grid columns={12}>
                        <Grid.Row>
                            <Grid.Column floated='left' width={12}>
                                <Button color='green' onClick={this.handleSubmit}>
                                    <Icon name='add' /> Submit
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={12}>
                                <span style={{ color: "white" }}>{statusMessage}</span>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    
                </Modal.Actions>
            </Modal>
        );
    }
}

export default props => (
    <Web3Consumer>
      {context => context.hasInitialised ? <PostSubmissionModal {...props} {...context} /> : React.Fragment}
    </Web3Consumer>
  );