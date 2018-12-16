let contractAbi = require('./contractAbi');
let contractBin = require('./contractBin');
let Web3 = require('web3');
let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
let ABI = require('ethereumjs-abi')

async function doWork() {
    let contract = new web3.eth.Contract(contractAbi);
    let address = '0x6909c5340cd84c69c91730b85652efcbf93562b9';
    let transaction = contract.deploy({
        data: "0x" + contractBin.object,
        arguments: [2, 2, [3, 1, 1, 3], [6, 6], [1, 1], 120]
    });
    await web3.eth.sendTransaction({
        from: address,
        data: transaction.encodeABI(),
        gas: await transaction.estimateGas(),
        value: '1000000000000000000'
    }).on('confirmation', function(confirmCount, receipt) {
        console.log('confirm', confirmCount);
    });
}

async function doWork2(contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let address = '0x5cde6c1220f964c167083f0409534582ca03b5ea';
    let hashValue = ABI.soliditySHA3(
        ['int32[]', 'bytes8', 'address'],
        [[0, 0], '0x123456', address]
    );
    let opt = 0;
    let method = contract.methods.solve(hashValue, opt);
    await method.send({
        from: address,
        gas: await method.estimateGas({
            from: address
        })
    });
}

async function doWork3(contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let address = '0x5cde6c1220f964c167083f0409534582ca03b5ea';
    let method = contract.methods.blindSolution('0x5cde6c1220f964c167083f0409534582ca03b5ea');
    let result = await method.call({
        from: address,
        gas: await method.estimateGas()
    });
    console.log(result);
}

async function doWork4(contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let address = '0x5cde6c1220f964c167083f0409534582ca03b5ea';
    let x = [0, 0];
    let nonce = '0x123456';
    let method = contract.methods.reveal(x, nonce);
    await method.send({
        from: address,
        gas: await method.estimateGas({
            from: address
        })
    });
}

async function doWork5(contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let address = '0x6909c5340cd84c69c91730b85652efcbf93562b9';
    let method = contract.methods.best();
    let result = await method.call({
        from: address,
        gas: await method.estimateGas({
            from: address
        })
    });
    console.log(result);
}

async function doWork6(contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let address = '0x5cde6c1220f964c167083f0409534582ca03b5ea';
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

async function doWork7(contractAddress) {
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    let address = '0x5cde6c1220f964c167083f0409534582ca03b5ea';
    let method = contract.methods.describe();
    let result = await method.call({
        from: address,
        gas: await method.estimateGas({
            from: address
        })
    });
    console.log(result);
};

doWork();

let contractAddr = '0x9bbb2012602d3c4bf0c918e09dd9368bda3105a6';
doWork2(contractAddr);

doWork3(contractAddr);

doWork4(contractAddr);

doWork5(contractAddr);

doWork6(contractAddr);

doWork7(contractAddr);
