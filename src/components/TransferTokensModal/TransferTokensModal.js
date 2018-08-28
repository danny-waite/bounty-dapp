import React, { Component } from 'react';
import { Form, Input } from 'semantic-ui-react'
import { ButtonModal } from "../ButtonModal";

class TransferTokensModal extends Component {

    handleChange = (e, { name, value }) => this.setState({ [name]: value });
    handleSubmit = async (e) => {
        await this.props.onSubmit(this.state);
        this.setState({ modalOpen: false });
    }

    render() {
        return (
            <ButtonModal title="Send Tokens" showButton={true} buttonText="Send Tokens" onSubmit={this.handleSubmit}>
                <Form size="huge">
                    <Form.Group widths='equal'>
                        <Form.Field name='amount' control={Input} label='Amount' placeholder='Amount' onChange={this.handleChange}/>
                        <Form.Field name='address' control={Input} label='Address' onChange={this.handleChange}/>
                    </Form.Group>
                </Form>
            </ButtonModal>
        );
    }
}

export default TransferTokensModal;

