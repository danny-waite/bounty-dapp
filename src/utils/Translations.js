import morphism from 'morphism';
import Web3 from "web3";

class Translations {

    static translateBounty = (raw) => {
        const statusList = ["Open", "Completed"];

        let schema = {
            // id: { path: "0", fn: value => value.toNumber() },
            poster: "0",
            title: "1",
            description: "2",
            prize: { path: "3", fn: value => Web3.utils.fromWei(value.toNumber().toString(), "ether") },
            status: { path: "4", fn: value => statusList[Web3.utils.hexToNumber(value)] },
            winner: "5",
            deadline: { path: "6", fn: value => new Date(value.toNumber()) },
        }
    
        return morphism(schema, raw).map((row, id) => {
            return ({
                id, ...row
            })
        });
    }

    static translateBountySubmission = (raw) => {
        // const statusList = ["Open", "Completed"];

        let schema = {
            address: "0",
            submissionHash: "1",
            payTokens: "2"
        }
    
        return morphism(schema, raw).map((row, id) => {
            return ({
                id, ...row
            })
        });
    }
}

export default Translations;
