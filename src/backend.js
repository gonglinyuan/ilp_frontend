import moment from "moment";

let contractAbi = require('./contractAbi');
let contractBin = require('./contractBin');
let creatorContractAbi = require('./creatorContractAbi');
let creatorContractBin = require('./creatorContractBin');
let Web3 = require('web3');
let web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
let ABI = require('./EthereumAbi');

const extra_gas = 10000;

function getBalance(address) {
    if (web3.utils.isAddress(address)) {
        return web3.eth.getBalance(address).then(web3.utils.fromWei);
    } else {
        return new Promise((resolve, reject) => {
            resolve("0");
        });
    }
}

// function submitProblem(address, problem, bounty, receiptCallback) {
//     let contract = new web3.eth.Contract(contractAbi);
//     let transaction = contract.deploy({
//         data: "0x" + contractBin.object,
//         arguments: [problem.n, problem.m, problem.a, problem.b, problem.c, problem.time]
//     });
//     transaction.estimateGas().then((gas => {
//         web3.eth.sendTransaction({
//             from: address,
//             data: transaction.encodeABI(),
//             gas: gas + extra_gas,
//             value: web3.utils.toWei(bounty, 'ether')
//         }).once('receipt', receiptCallback);
//     }));
// }
//
function createProblemList(address, receiptCallback) {
    let contract = new web3.eth.Contract(creatorContractAbi);
    let transaction = contract.deploy({
        data: "0x" + creatorContractBin.object
    });
    transaction.estimateGas().then((gas => {
        web3.eth.sendTransaction({
            from: address,
            data: transaction.encodeABI(),
            gas: gas + extra_gas
        }).once('receipt', receiptCallback);
    }));
}

function createProblem(address, contractAddress, problem, bounty, callback) {
    let contract = new web3.eth.Contract(creatorContractAbi, contractAddress);
    let method = contract.methods.createProblem(problem.n, problem.m, problem.a, problem.b, problem.c, problem.time);
    // console.log(contract);
    // console.log(method);
    method.estimateGas({
        from: address
    }).then((gas) => {
        method.send({
            from: address,
            gas: gas + extra_gas,
            value: web3.utils.toWei(bounty, 'ether')
        }).on('receipt', callback);
    });
}

function getProblemList(address, contractAddress, callback) {
    let contract = new web3.eth.Contract(creatorContractAbi, contractAddress);
    let method = contract.methods.problemList();
    method.estimateGas({
        from: address
    }).then((gas) => {
        method.call({
            from: address,
            gas: gas + extra_gas
        }).then(callback);
    });
}

function getDesription(address, contractAddress, callback) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let method = contract.methods.describe();
    method.estimateGas({
        from: address
    }).then((gas) => {
        method.call({
            from: address,
            gas: gas + extra_gas
        }).then((arr) => {
            let problem = {
                n: parseInt(arr[0].replace(/ /g, '')),
                m: parseInt(arr[1].replace(/ /g, '')),
                a: arr[2].map((x) => parseInt(x.replace(/ /g, ''))),
                b: arr[3].map((x) => parseInt(x.replace(/ /g, ''))),
                c: arr[4].map((x) => parseInt(x.replace(/ /g, ''))),
                deadline: new Date(parseInt(arr[5].replace(/ /g, '')) * 1000),
                owner: arr[6],
                opt: parseInt(arr[7].replace(/ /g, '')),
                finished: arr[8],
                bounty: web3.utils.fromWei(arr[9], "ether")
            };
            callback(problem);
        });
    })
}

function commitSolution(address, contractAddress, solution, nonce, opt, confirmCallback) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let hashValue = ABI.soliditySHA3(
        ['int32[]', 'bytes8', 'address'],
        [solution, nonce, address]
    );
    let method = contract.methods.solve(hashValue, opt);
    method.estimateGas({
        from: address
    }).then((gas) => {
        method.send({
            from: address,
            gas: gas + extra_gas
        }).on("confirmation", confirmCallback);
    });
}

function revealSolution(address, contractAddress, solution, nonce, opt) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let method = contract.methods.reveal(solution, nonce, opt);
    method.estimateGas({
        from: address
    }).then((gas) => {
        method.send({
            from: address,
            gas: gas + extra_gas
        });
    });
}

function claimReward(address, contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let method = contract.methods.finish();
    method.estimateGas({
        from: address
    }).then((gas) => {
        method.send({
            from: address,
            gas: gas + extra_gas
        });
    });
}

function isValidAddress(address) {
    return web3.utils.isAddress(address);
}

// submitProblem("0x21d094990Cf65dc8BA0a2c2afc734d0f66A8b523", {
//     n : 2,
//     m : 2,
//     a : [3, 1, 1, 3],
//     b : [6, 6],
//     c : [1, 1],
//     time : 120
// }, "10", console.log);

let backend = {
    getBalance: getBalance,
    createProblem: createProblem,
    getDesription: getDesription,
    commitSolution: commitSolution,
    revealSolution: revealSolution,
    claimReward: claimReward,
    getProblemList: getProblemList,
    isValidAddress: isValidAddress
};

export default backend;