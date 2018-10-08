const solc = require('solc');

const sol = 'contract SimpleStorage {string storedData;function set(string x) {storedData = x;}function get() constant returns (string x) {return storedData;}}';
const output = solc.compile(sol, 1);
const bytecode = output.contracts['Token'].bytecode;
const abi = JSON.parse(output.contracts['Token'].interface);

console.log(output);