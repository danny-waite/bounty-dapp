const Web3 = require("web3");

const toEther = value => {
    return Web3.utils.fromWei(value.toNumber().toString(), "ether");
}

const toWei = value => {
    return Web3.utils.toWei(value.toString(), "ether");
}

const waitForEvent = _event => 
  new Promise((resolve, reject) => 
    _event.watch((err, res) =>
      err ? reject(err) : (resolve(res), _event.stopWatching())));

const PREFIX = "VM Exception while processing transaction: ";

const sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const assertFail = async function(callback) {
    let web3_error_thrown = false;
    try {
        const tr = await callback();
        if (tr && tr.receipt) {
          web3_error_thrown =
            (tr.receipt.status === '0x0') // geth
            || (tr.receipt.status === null); // parity
        }
    } catch (error) {
        if (error.message.search("invalid opcode")) web3_error_thrown = true;
    }
    assert.ok(web3_error_thrown, "Transaction should fail");
};

const assertSuccess = async function(callback) {
    let web3_error_thrown = false;
    try {
        const tr = await callback();
        if (tr && tr.receipt) {
          web3_error_thrown =
            (tr.receipt.status === '0x0') // geth
            || (tr.receipt.status === null); // parity
        }
    } catch (error) {
        if (error.message.search("invalid opcode")) web3_error_thrown = true;
    }
    assert.isFalse(web3_error_thrown, "Transaction should succeed");
};

module.exports = {
    waitForEvent,
    PREFIX,
    toEther,
    toWei,
    sleep,
    assertFail,
    assertSuccess
}
