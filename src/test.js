let contractAbi = require('./contractAbi');
let contractBin = require('./contractBin');
let Web3 = require('web3');
let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
let ABI = require('./EthereumAbi')

async function submitProblem(address, problem, value) {
    let contract = new web3.eth.Contract(contractAbi);
    let transaction = contract.deploy({
        data: "0x" + contractBin.object,
        arguments: problem
    });
    await web3.eth.sendTransaction({
        from: address,
        data: transaction.encodeABI(),
        gas: await transaction.estimateGas(),
        value: value
    }).on('confirmation', function(confirmCount, receipt) {
        console.log('confirm', confirmCount);
    });
}

async function commitSolution(address, contractAddress, solution, nonce, opt) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let hashValue = ABI.soliditySHA3(
        ['int32[]', 'bytes8', 'address'],
        [solution, nonce, address]
    );
    let method = contract.methods.solve(hashValue, opt);
    await method.send({
        from: address,
        gas: await method.estimateGas({
            from: address
        })
    });
}

async function getBlindSolution(address, contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let method = contract.methods.blindSolution(address);
    let result = await method.call({
        from: address,
        gas: await method.estimateGas()
    });
    console.log(result);
}

async function revealSolution(address, contractAddress, solution, nonce) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let method = contract.methods.reveal(solution, nonce);
    await method.send({
        from: address,
        gas: await method.estimateGas({
            from: address
        })
    });
}

async function getBest(address, contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let method = contract.methods.best();
    let result = await method.call({
        from: address,
        gas: await method.estimateGas({
            from: address
        })
    });
    console.log(result);
}

async function retrieveAward(address, contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let method = contract.methods.finish();
    console.log(await method.estimateGas({
        from: address
    }));
    await method.send({
        from: address,
        gas: await method.estimateGas({
            from: address
        }) + 100000
    });
};

async function getDesription(address, contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let method = contract.methods.describe();
    let result = await method.call({
        from: address,
        gas: await method.estimateGas({
            from: address
        })
    });
    console.log(result);
};

submitProblem('0x12a761391996EBdb04c3faB0c91c414450cAb9c0', [2, 2, [3, 1, 1, 3], [6, 6], [1, 1], 120], '1000000000000000000');

let contractAddr = '0x769530531CF6d2ecf24b029D3362daB6C3e23766';
let address = '0xD54D54286cFbC47f9b28fA4eE8a0d7cbCA4F42F9';

commitSolution(address, contractAddr, [0, 0], '0x123456', 0);

getBlindSolution(address, contractAddr);

revealSolution(address, contractAddr, [0, 0], '0x123456');

getBest(address, contractAddr);

retrieveAward(address, contractAddr);

getDesription(address, contractAddr);
