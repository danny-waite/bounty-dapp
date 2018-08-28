import React, { Component } from 'react';
import { Button, Modal, Icon } from 'semantic-ui-react'

class ButtonModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: null,
            receipt: null,
            modalOpen: false
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
    handleClose = () => this.setState({ modalOpen: false })

    render() {
        const { title, buttonText, showButton, children } = this.props;
        const { modalOpen, errorMessage, receipt } = this.state;

        return (
            showButton &&
            <Modal 
                trigger={<Button onClick={this.handleOpen}>{buttonText}</Button>}
                open={modalOpen}
                onClose={this.handleClose}
            >
                <Modal.Header>{title}</Modal.Header>
                <Modal.Content>
                     {children}
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color='green' onClick={this.props.onSubmit}>
                        <Icon name='add' /> Submit
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default ButtonModal;