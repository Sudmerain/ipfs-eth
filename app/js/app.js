'use strict'

var ipfsAPI = require('ipfs-api')

var ipfs = ipfsAPI('localhost', '5001')

var SHA256 = require('crypto-js/sha256');


var fileData = ""

var slices = []

var hashResult = [];

var publicTree = []; //merkle tree which index increase from bottom to top, from right to left
var publicIndex;

var npublicTree = []; //转置之后的树  transpose publicTree to get npublicTree
var path = []; //auxiliary path
var sliceLength;

window.originRoot = "";
window.originRootAddress = "";


window.lovedd = function(){
  alert("dd, I love you!!!");
}

window.uploadFile = function() {
  getFileContent().then(function(){
    sliceData(fileData);
  }).then(function(){
    hashData(slices);
    console.log(hashResult);
  }).then(function(){
    merkleTree();
  }).then(function(){
    $("#root").text("MerkleRoot is: " + originRoot)
  }).then(function(){
    storeData(window.originRoot);
  })
  
}

function getFileContent(){
  return new Promise(function (resolve, reject) {
    var resultFile = document.getElementById("uploadfile").files[0];
    if (resultFile) {
        var reader = new FileReader();
        reader.readAsText(resultFile, 'UTF-8');
        reader.onload = function(e) {
          fileData = this.result;
          resolve("上传成功");
        }
    }else{
      alert("上传的文件内容为空！！！");
      reject("上传的文件内容为空！！！")
    }
  })  
}


function storeData(data){
  return new Promise(function (resolve, reject) {
    if(data == ""){
      reject("数据不能为空！！！");
    }
    console.log(data);
    ipfs.files.add(Buffer.from(data), (err, res) => {
      if (err || !res) {
        return console.error('ipfs add error', err, res)
      }

      res.forEach((file) => {
        if (file && file.hash) {
          console.log('successfully stored, you can see it at http://localhost:8080/'+file.hash)
          window.originRootAddress = file.hash;
        }
      })
    })
  })
}

function display (hash) {
  // buffer: true results in the returned result being a buffer rather than a stream
  ipfs.files.cat(hash, (err, data) => {
    if (err) { return console.error('ipfs cat error', err) }
    var content = new TextDecoder("utf-8").decode(data);
    console.log(content);
  })
}

function sliceData(str) {
  return new Promise(function (resolve, reject) {
    if(str == ""){
      reject("数据不能为空");
    }
    var strlen = str.length;
    for (var i = 0, j = 0; i < strlen; i += 2, j++) {
        var tmpstr = str.slice(i, i + 2);
        slices.push(j + tmpstr);
    }
  })    
}

function hashData(arr) {  //slice and hash data to get hashresult[]
  return new Promise(function (resolve, reject) {
    if(arr.length == 0){
      reject("数组为空");
    }
    for (var i = 0; i < arr.length; i++) {
        var hashresulti = SHA256(arr[i].trim());
        hashResult.push(hashresulti);
    }
  })
}

function merkleTree() {  //use hashresult to genarate merkle tree
  return new Promise(function (resolve, reject) {
    var tempTxList = [];
    for (var i = 0; i < hashResult.length; i++) {
        tempTxList.push(hashResult[i].toString());
    }
    var newTxList = pregetNewTxList(tempTxList);  //the first layer of merkle tree, that is pre-leaves

    while (newTxList.length != 1) {
        newTxList = getNewTxList(newTxList);  //the other layers
    }
    publicIndex = publicTree.length;
    publicTree[publicIndex++] = (newTxList[0].toString());  //the merkle tree root
    console.log(publicTree);
    console.log(publicTree.length);
    console.log(newTxList[0].toString());
    window.originRoot = newTxList[0].toString();
  })
}

function pregetNewTxList(tempTxList) {   //the first layer of merkle tree, that is pre-leaves
    var newTxList = [];
    var index = 0;
    var index1 = 0;
    var index2 = 0;
    var prepublicTree = [];

    publicIndex = Number(tempTxList.length) - Number(1);
    while (index2 < tempTxList.length) { // transpose tempTxList to prepublicTree
        var preleave = tempTxList[index2].toString();
        var leave = SHA256(preleave.trim()).toString();
        prepublicTree[publicIndex] = (leave);
        publicIndex--;
        index2++;
    }
    while (index < tempTxList.length) {  //hash this layer to get father layer
        // left        
        var preleft = tempTxList[index].toString();
        var left = SHA256(preleft.trim()).toString();

        index++;
        // right
        var preright = "";
        var right = "";
        if (index != tempTxList.length) {
            preright = tempTxList[index].toString();
            right = SHA256(preright.trim()).toString();
        }

        // sha2 hex value
        var leaves = (left + right).trim();
        var sha256Value = SHA256(leaves);

        newTxList[index1] = (sha256Value);
        index1++;
        index++;
    }
    publicTree = prepublicTree;  //use prepublicTree to set publicTree
    console.log(publicTree);
    return newTxList;
}

function getNewTxList(tempTxList) {  //the other layers of merkle tree
    var newTxList = [];
    var index = 0;
    var index1 = 0;
    var index2 = 0;
    var prepublicTree = [];
    publicIndex = Number(tempTxList.length) - Number(1);
    //  console.log(publicIndex);
    while (index2 < tempTxList.length) {  // transpose tempTxList to prepublicTree
        var leave = tempTxList[index2].toString();
        prepublicTree[publicIndex] = (leave);
        publicIndex--;
        index2++;
    }

    while (index < tempTxList.length) {  //hash this layer to get father layer
        console.log(publicTree.length);

        var left = tempTxList[index].toString();
        index++;

        var right = "";
        if (index != tempTxList.length) {
            right = tempTxList[index].toString();
        }

        var leaves = (left + right).trim();
        var sha256Value = SHA256(leaves);

        newTxList[index1] = (sha256Value);
        index1++;
        index++;
    }
    publicTree = publicTree.concat(prepublicTree); //add prepublicTree to publicTree
    //  console.log(prepublicTree);
    console.log(publicTree);
    return newTxList;
}
