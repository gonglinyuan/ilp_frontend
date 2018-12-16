const Web3 = require('web3');
const ABI = require('./EthereumAbi');
const contractAbi = require("./contractAbi");
const contractBin = require("./contractBin");
const surrogateGas = 10000;

class Problem {
    constructor(n, m, a, b, c, time, owner, bounty) {
        console.assert(n > 0);
        console.assert(m >= 0);
        console.assert(a.length === n * m);
        console.assert(b.length === m);
        console.assert(c.length === n);
        console.assert(time > 0);
        this.n = n;
        this.m = m;
        this.a = a;
        this.b = b;
        this.c = c;
        this.time = time;
        this.owner = owner;
        this.bounty = bounty;
    }

    async deploy() {
        let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

        let contract = new web3.eth.Contract(contractAbi);
        let transaction = contract.deploy({
            data: "0x" + contractBin.object,
            arguments: [this.n, this.m, this.a, this.b, this.c, this.time]
        });
        await web3.eth.sendTransaction({
            from: this.owner,
            data: transaction.encodeABI(),
            gas: (await transaction.estimateGas()) + surrogateGas,
            value: this.bounty
        }).on('confirmation', function(confirmCount, receipt) {
            console.log('deploy confirm', confirmCount);
        });
    }
}

export default Problem;