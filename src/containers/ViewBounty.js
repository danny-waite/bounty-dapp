import React, { Component } from 'react';
import { Web3Consumer } from "../providers/web3";

import { Menu, Segment } from 'semantic-ui-react'

import { BountySubmissionsList } from "../components/BountySubmissionsList";
import { PostSubmissionModal } from "../components/PostSubmissionModal";

class ViewBounty extends Component {

    constructor(props) {
        super(props);

        this.state = {
            bounty: null,
            submissions: [],
            escrowAmount: null
        }
    }

    async componentDidMount() {
        const { getBounty, getBountyEscrow } = this.props;

        const bountyId = parseInt(this.props.match.params.id);

        const bounty = await getBounty(bountyId);
        this.setState({ bounty });

        const escrowAmount = await getBountyEscrow(bountyId);
        this.setState({ escrowAmount });
        
        this.getSubmissions(bounty.id);

    }

    postSubmission = async(submission) => {
        const { postBountySubmission } = this.props;
        const { bounty } = this.state;

        const result = await postBountySubmission(bounty.id, submission);

        return result;
    }

    getSubmissions = async(bountyId) => {
        const { getBountySubmissions } = this.props;
        const submissions = await getBountySubmissions(bountyId);

        this.setState({ submissions });
    }

    awardHandler = async(bountyId, submissionId) => {
        const { awardBounty } = this.props;

        const awardResult = await awardBounty(bountyId, submissionId);

        //TODO: nasty hack
        window.location.reload();
    }

    render() {
        const { account } = this.props;
        const { bounty, submissions, escrowAmount } = this.state;

        const showAward = bounty && bounty.poster === account && bounty.status === "Open"; // and not past deadline

        return (
            bounty &&
            <div>
                <Menu secondary>
                    <PostSubmissionModal 
                        title="Submit Entry" 
                        buttonText="Submit Entry" 
                        showButton={ bounty.poster !== account && bounty.status === "Open" }
                        onSubmit={this.postSubmission}
                        refreshSubmissions={() => this.getSubmissions(bounty.id) }
                    />
                    {/* <AwardBountyModal
                        title="Award Bounty"
                        buttonText="Award Bounty"  */}
                </Menu>
                <Segment>
                    <h1>{bounty.title}</h1>
                    <h3>{bounty.description}</h3>
                    <h4>Prize {bounty.prize} ETH</h4>
                    <h4>Escrow {escrowAmount} ETH</h4>
                    <h4>Submitter {bounty.poster}</h4>
                    <h4>Status {bounty.status}</h4>
                    {bounty.status === "Completed" && <h4>Winner {bounty.winner}</h4>}
                </Segment>
                <Segment>
                    <BountySubmissionsList bountyId={bounty.id} data={submissions} awardHandler={this.awardHandler} showAward={ showAward } />
                </Segment>
            </div>
        );
    }
}

export default props => (
    <Web3Consumer>
      {context => context.hasInitialised ? <ViewBounty {...props} {...context} /> : React.Fragment}
    </Web3Consumer>
  );