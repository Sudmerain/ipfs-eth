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

window.originRootAddress = {address:""}

window.newRoot = "";
window.newRootAddress = {address:""};

window.lovedd = function(){
  alert("dd, I love you!!!");
}

window.uploadFile = function() {
  slices = [];
  hashResult = [];
  publicTree = [];

  getFileContent().then(function(){
    sliceData(fileData);
  }).then(function(){
    hashData(slices);
  }).then(function(){
    merkleTree();
  }).then(function(){
    $("#root").text("MerkleRoot is: " + originRoot)
  }).then(function(){
    storeData(window.originRoot, window.originRootAddress);
  })
  
}

function getFileContent(){
  return new Promise(function (resolve, reject) {
    var resultFile = document.getElementById("uploadfile").files[0];
    if (resultFile) {
        var reader = new FileReader();
        reader.readAsText(resultFile, 'UTF-8');
        reader.onload = function(e) {
          fileData = this.result.trim();
          resolve("上传成功");
        }
    }else{
      alert("上传的文件内容为空！！！");
      reject("上传的文件内容为空！！！")
    }
  })  
}


function storeData(data, address){
  return new Promise(function (resolve, reject) {
    if(data == ""){
      reject("数据不能为空！！！");
    }
    ipfs.files.add(Buffer.from(data), (err, res) => {
      if (err || !res) {
        return console.error('ipfs add error', err, res)
      }

      res.forEach((file) => {
        if (file && file.hash) {
          console.log('successfully stored, you can see it at http://localhost:8080/'+file.hash)
          address.address = file.hash;
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
    str = str.trim();
    var strlen = str.trim().length;
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
    window.originRoot = "0x" + newTxList[0].toString();
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
    return newTxList;
}


//验证阶段

window.computeRoot2 = function (){
  if(window.originRoot != "" && window.newRootAddress.address != ""){
    return;
  }

  var challenge = $("#challengeNum").val();
  var preleaves = getPreleaves().toString();
  var auxiliarypath = getAuxiliarypath();
  var publictreelength = publicTree.length;
  var leave=SHA256(preleaves.trim()).toString();
  if(!preleaves || !auxiliarypath || !publictreelength){
    alert("计算root2出现异常！！！");
    return;
  }
  
  var h1=0;
  var h2=0;

  var path = auxiliarypath;
  var deep = 0;
  var k = 0;
  while (k < publictreelength) { //deep of the tree
    k += Math.pow(2, deep);
    deep++;
  }

  var start = 0;   //i is the challenge's index in npublicTree 
  for (var i = 0; i < deep - 1; i++) {
      start += Math.pow(2, i);
  }
  start++;
  var i = Number(challenge) + Number(start); //i is the index of verified shard in npublictree
  console.log("the verified index is "+i);

  //拼接辅助路径，验证的位置不同，拼接的方法不同
  var j=0;
  while (j < path.length) {
      if (i % 2 == 0) {
        console.log(i);
        var digest = leave.concat(path[j]);          
        i = i / 2;
        console.log(i);

      } else if (i % 2==1) {
        console.log(i);
        var digest = path[j].concat(leave);          
        i = (i - 1)/ 2;
        console.log(i);
      }
      j +=1;
      console.log(digest);
      leave = SHA256(digest.trim()).toString(); //use auxiliary path to hash to get father leave
      console.log(leave);
  }
 
  window.newRoot = '0x'.concat(leave);  //root2 is the new merkle tree 
  $("#root2").text("MerkleRoot2 is: " + newRoot);

  storeData(window.originRoot, window.newRootAddress);  
}

function getPublictreeLength(publicTree){
  var h1=0;
  var tmpTree=[];
  while(h1<publicTree.length){   //将数据树转换成数组
    tmpTree.push(publicTree.substr(h1,64));
    h1+=65;
  }   
  console.log(tmpTree.length);
  return tmpTree.length;
}


function getPreleaves(){
  var num = $("#challengeNum").val();
  if(num < 0 || num >= hashResult.length){
    alert("分片索引超出范围！！！");
    return ;
  }
  return hashResult[num];
}

function getAuxiliarypath() {
  var num = $("#challengeNum").val();
  if(num < 0 || num >= hashResult.length){
    alert("分片索引超出范围！！！");
    return ;
  }
  transArray(publicTree);  //transpose publicTree to get npublicTree
  var n = Math.log(publicTree.length + 1) / Math.log(2); //deep of the tree
  var leavesnum = Math.pow(2, n - 1); //the num of leaves
  var i = Number(num) + Number(leavesnum); //i is the index on the npublicTree
  console.log(npublicTree);
  var j = 0;
  while (i != 1) {
      if (i % 2 == 0) {
          path[j] = npublicTree[i + 1];
      } else {
          path[j] = npublicTree[i - 1];
      }
      j++;
      i = Math.floor(i / 2);
  }
  return path; //path[] is the auxiliary path of shard i
}

function transArray(publicTree) {   //transpose publicTree to get npublicTree
    for (var i = 0, j = publicTree.length; i < publicTree.length; i++, j--) {
        npublicTree[j] = publicTree[i];
    }
    npublicTree[0] = "";
}

window.toHash = function(str){
  return "0x" + SHA256(str).toString();
}


  