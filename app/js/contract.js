var web3Host    = 'http://localhost';
var web3Port    = '8545';

/* web3 initialization */
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));
if (!web3.isConnected()) {
    console.error("Ethereum - no connection to RPC server");
} else {
    console.log("Ethereum - connected to RPC server");
}


var simplestorageContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"x","type":"string"}],"name":"set","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"x","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}]);
var rootInstance;
var root2Instance;

// var simplestorageContractInstance;

var integrityContract = web3.eth.contract([{"constant":true,"inputs":[{"name":"root1","type":"bytes32"},{"name":"root2","type":"bytes32"}],"name":"compare","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]);
var integrityContractInstance;

var rootData = {value:""};
var root2Data = {value:""};

var fetching = false;
var deploying = false;

var transHash = "";

var gasCost = 0;

window.deployRootAddress2Eth = function(){
    var loveNumber = Math.floor(Math.random() * 100) ;
    if(loveNumber % 3 == 0){
        alert("Dongdong, I love you forever! :) Yours Pengpeng :-");
    }
    if(window.originRootAddress.address == ""){
        alert("root的地址hash值不能为空！！！");
        return;        
    }
    console.log("root's ipfs address:" + window.originRootAddress.address); 
    deployRootStorage();
    storeAddress(window.originRootAddress.address, rootInstance);
    // storeAddress("dd, i love you", rootInstance);
    fetchEthData(rootInstance, rootData);
}

window.deployRoot2Address2Eth = function(){
    var loveNumber = Math.floor(Math.random() * 100) ;
    if(loveNumber % 5 == 0){
        alert("Dongdong, You are my world! :) Yours Pengpeng :-");
    }

    if(window.newRootAddress.address == ""){
        computeRoot2();
        alert("root2的地址hash值不能为空！！！");
        return;        
    }
    console.log("root2's ipfs address:" + window.newRootAddress.address);
    deployRoot2Storage();
    storeAddress(window.newRootAddress.address, root2Instance);
    // storeAddress("dd, i love you forever", root2Instance);
    fetchEthData(root2Instance,root2Data);
}

window.verify = function(){
    if(rootData.value == "" || root2Data.value == ""){
        alert("等待计算结果！！！");
        return;
    }
    deployintegrityContract();
    compareRoot(rootData.value, root2Data.value);
}


function deployRootStorage(){
    if(rootInstance){
        return;
    }
    if(deploying){
        alert("正在部署合约，请稍后点击:)");
        return ;
    }
    deploying = true;    
    var simplestorage = simplestorageContract.new(
       {
         from: web3.eth.accounts[0], 
         data: '0x608060405234801561001057600080fd5b506102a7806100206000396000f30060806040526004361061004b5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416634ed3885e81146100505780636d4ce63c146100ab575b600080fd5b34801561005c57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526100a99436949293602493928401919081908401838280828437509497506101359650505050505050565b005b3480156100b757600080fd5b506100c061014c565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100fa5781810151838201526020016100e2565b50505050905090810190601f1680156101275780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b80516101489060009060208401906101e3565b5050565b60008054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156101d85780601f106101ad576101008083540402835291602001916101d8565b820191906000526020600020905b8154815290600101906020018083116101bb57829003601f168201915b505050505090505b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061022457805160ff1916838001178555610251565b82800160010185558215610251579182015b82811115610251578251825591602001919060010190610236565b5061025d929150610261565b5090565b6101e091905b8082111561025d57600081556001016102675600a165627a7a7230582066904e2c64ce5061104e8bbd9ef78c14f7e2df93520de41d95d91acbf38d34cd0029', 
         gas: '4700000'
       }, function (e, contract){
        console.log(e, contract);
        if (typeof contract.address !== 'undefined') {
             console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
             rootInstance = simplestorageContract.at(contract.address);
             deploying = false;
             var amount =  web3.eth.gasPrice * web3.eth.estimateGas({
              from: web3.eth.accounts[0], 
                data: '0x608060405234801561001057600080fd5b506102a7806100206000396000f30060806040526004361061004b5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416634ed3885e81146100505780636d4ce63c146100ab575b600080fd5b34801561005c57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526100a99436949293602493928401919081908401838280828437509497506101359650505050505050565b005b3480156100b757600080fd5b506100c061014c565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100fa5781810151838201526020016100e2565b50505050905090810190601f1680156101275780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b80516101489060009060208401906101e3565b5050565b60008054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156101d85780601f106101ad576101008083540402835291602001916101d8565b820191906000526020600020905b8154815290600101906020018083116101bb57829003601f168201915b505050505090505b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061022457805160ff1916838001178555610251565b82800160010185558215610251579182015b82811115610251578251825591602001919060010190610236565b5061025d929150610261565b5090565b6101e091905b8082111561025d57600081556001016102675600a165627a7a7230582066904e2c64ce5061104e8bbd9ef78c14f7e2df93520de41d95d91acbf38d34cd0029', 
                gas: '4700000'});
             console.log("消耗Gas：" + amount);
             $("#gas").append("<p>部署SimplestorageContract合约消耗 gas 数量: " + amount + "</p>");
             gasCost += amount;
        }
     })
}

function deployRoot2Storage(){
    if(root2Instance){
        return;
    }    
    if(deploying){
        alert("正在部署合约，请稍后点击:)");
        return ;
    }
    deploying = true;    
    var simplestorage = simplestorageContract.new(
       {
         from: web3.eth.accounts[0], 
         data: '0x608060405234801561001057600080fd5b506102a7806100206000396000f30060806040526004361061004b5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416634ed3885e81146100505780636d4ce63c146100ab575b600080fd5b34801561005c57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526100a99436949293602493928401919081908401838280828437509497506101359650505050505050565b005b3480156100b757600080fd5b506100c061014c565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100fa5781810151838201526020016100e2565b50505050905090810190601f1680156101275780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b80516101489060009060208401906101e3565b5050565b60008054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156101d85780601f106101ad576101008083540402835291602001916101d8565b820191906000526020600020905b8154815290600101906020018083116101bb57829003601f168201915b505050505090505b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061022457805160ff1916838001178555610251565b82800160010185558215610251579182015b82811115610251578251825591602001919060010190610236565b5061025d929150610261565b5090565b6101e091905b8082111561025d57600081556001016102675600a165627a7a7230582066904e2c64ce5061104e8bbd9ef78c14f7e2df93520de41d95d91acbf38d34cd0029', 
         gas: '4700000'
       }, function (e, contract){
        console.log(e, contract);
        if (typeof contract.address !== 'undefined') {
             console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
             root2Instance = simplestorageContract.at(contract.address);
             deploying = false;

             var amount =  web3.eth.gasPrice * web3.eth.estimateGas({
              from: web3.eth.accounts[0], 
                data: '0x608060405234801561001057600080fd5b506102a7806100206000396000f30060806040526004361061004b5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416634ed3885e81146100505780636d4ce63c146100ab575b600080fd5b34801561005c57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526100a99436949293602493928401919081908401838280828437509497506101359650505050505050565b005b3480156100b757600080fd5b506100c061014c565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100fa5781810151838201526020016100e2565b50505050905090810190601f1680156101275780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b80516101489060009060208401906101e3565b5050565b60008054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156101d85780601f106101ad576101008083540402835291602001916101d8565b820191906000526020600020905b8154815290600101906020018083116101bb57829003601f168201915b505050505090505b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061022457805160ff1916838001178555610251565b82800160010185558215610251579182015b82811115610251578251825591602001919060010190610236565b5061025d929150610261565b5090565b6101e091905b8082111561025d57600081556001016102675600a165627a7a7230582066904e2c64ce5061104e8bbd9ef78c14f7e2df93520de41d95d91acbf38d34cd0029', 
                gas: '4700000'});
             console.log("消耗Gas：" + amount);
             $("#gas").append("<p>部署SimplestorageContract合约消耗 gas 数量: " + amount + "</p>");
             gasCost += amount;
        }
     })
}

function storeAddress(data, simplestorageContractInstance){
    if (!simplestorageContractInstance) {
        console.error('Ensure the storage contract has been deployed');
        return;
    }
    if(fetching){
        return;
    }
    fetching = true;
    simplestorageContractInstance.set.sendTransaction(data,
    {
        from: web3.eth.accounts[0], 
        gas: '4700000'
    }, 
    function (err, result) {
        if (err) {
            console.error("Transaction submission error:", err);                
        } else {
            console.log("Address successfully stored. Transaction hash:", result);
            transHash = result;
            var amount = web3.eth.gasPrice * simplestorageContractInstance.set.estimateGas(data, {from: web3.eth.accounts[0]});
            gasCost += amount;
            console.log("消耗Gas：" + amount);
            $("#gas").append("<p>SimplestorageContract.set() 方法此次消耗 gas 数量: " + amount + "</p>");
        }
    });
    
}

function fetchEthData(simplestorageContractInstance, data) { //simplestorageContractInstance, data
    if (!simplestorageContractInstance) {
        console.error("Storage contract has not been deployed");
        return;
    }
    simplestorageContractInstance.get.call(function (err, result) {
        if (err) {
            console.error("Content fetch error:", err);
        } else if (result) {
            console.log("Content successfully retrieved:", result);
            data.value = result;
            fetching = false;
            $("#transHash").html("Address successfully stored. </br>Transaction hash: " + transHash);

            var amount = web3.eth.gasPrice * simplestorageContractInstance.get.estimateGas({from: web3.eth.accounts[0]});
            gasCost += amount;
            console.log("消耗Gas：" + amount);
            $("#gas").append("<p>SimplestorageContract.get() 方法此次消耗 gas 数量: " + amount + "</p>");

            alert("部署到Ethereum成功！！！");
        } else {
            console.error('No data, verify the transaction has been mined');
            alert("正在部署到Ethereum，请等待30S后再次点击:)");
        }
    });
}

function deployintegrityContract(){
    if(integrityContractInstance){
        return ;
    }
    if(deploying){
        alert("正在部署合约，请稍后点击:)");
        return ;
    }
    deploying = true;
    var integrity = integrityContract.new(
    {
        from: web3.eth.accounts[0], 
        data: '0x608060405234801561001057600080fd5b5060bb8061001f6000396000f300608060405260043610603e5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166328602ab281146043575b600080fd5b348015604e57600080fd5b50605b600435602435606d565b60408051918252519081900360200190f35b600082821415607f5760016000556085565b60026000555b50600054929150505600a165627a7a7230582000e053ebbab0019c0a0777b3939965ec7c588d8c7ec18a8e149e23050df9bea70029', 
        gas: '4700000'
    }, function (e, contract){
        console.log(e, contract);
        if (typeof contract.address !== 'undefined') {
            console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
            integrityContractInstance = integrityContract.at(contract.address);
            deploying = false;

            var amount =  web3.eth.gasPrice * web3.eth.estimateGas({
                    from: web3.eth.accounts[0], 
                    data: '0x608060405234801561001057600080fd5b5060bb8061001f6000396000f300608060405260043610603e5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166328602ab281146043575b600080fd5b348015604e57600080fd5b50605b600435602435606d565b60408051918252519081900360200190f35b600082821415607f5760016000556085565b60026000555b50600054929150505600a165627a7a7230582000e053ebbab0019c0a0777b3939965ec7c588d8c7ec18a8e149e23050df9bea70029', 
                    gas: '4700000'
              });
             console.log("消耗Gas：" + amount);
             $("#gas").append("<p>部署IntegrityContract合约消耗 gas 数量: " + amount + "</p>");
             gasCost += amount;
        }
    })
}

function compareRoot(root, root2){
    if (!integrityContractInstance) {
        console.error("Integrity contract has not been deployed");
        return;
    }
    root = toHash(root);
    root2 = toHash(root2);
    console.log(root + "-" + root2);
    console.log(root == root2);
    integrityContractInstance.compare.call(root2, root, function (err, result) {
        if(err){
            console.err("Compare error:", err);
        }else if (result){
            var amount = web3.eth.gasPrice * integrityContractInstance.compare.estimateGas(root2, root, {from: web3.eth.accounts[0]});
            gasCost += amount;
            console.log("消耗Gas：" + amount);
            $("#gas").append("<p>IntegrityContract.compare() 方法此次消耗 gas 数量: " + amount + "</p>");
            $("#gas").append("<p>一共消耗 gas 数量: " + gasCost + "</p>");
            
            if(result.valueOf() == 2) {
                console.log("数据片被损坏！")
                $("#verifyResulst").text("数据分片验证结果：数据片被损坏！")
            } else {
                console.log("数据片完好！");
                $("#verifyResulst").text("数据分片验证结果：数据片完好！");                
            }
        }else{
            console.error('No data, verify the transaction has been mined');
            $("#verifyResulst").text("数据分片验证结果：验证中...");
        }
    });
}

