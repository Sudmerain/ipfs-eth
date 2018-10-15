# ipfs-eth

本项目使用了IPFS和Ethereum搭建了一个简单的文件存储和验证系统。

## 依赖环境

### IPFS

#### 安装IPFS
- 在Windows上：去网上或者官网搜索下载IPFS压缩包，解压到本地，你会发现有一个ipfs.exe的执行程序。

#### 运行
- 切换到该目录下，在命令行里输入：`ipfs deamon` 就可以运行IPFS的程序。

#### 具体操作
- 可以去查看[官网](https://github.com/ipfs)的API，或者使用`ipfs help`命令查看具体的操作。

### Geth

#### 安装Geth
- 去[官网](https://geth.ethereum.org/downloads/)下载安装包，直接安装到本地。

#### 运行
- 切换到Geth的运行目录，执行如下的步骤：
- 初始化数据目录，并新建账户 `geth --datadir="./" account new`
- 需要新建一个genesisblock.json文件，用以生成创世区块，其内容如下：
```
{
    "config": {
        "chainID"       : 10,
        "homesteadBlock": 0,
        "eip155Block":    0,
        "eip158Block":    0
    },
    "nonce": "0x01",
    "difficulty": "0x10",
    "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "coinbase": "0x0000000000000000000000000000000000000000",
    "timestamp": "0x00",
    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "extraData": "0x00",
    "gasLimit": "0xFFFFFF",
    "alloc": {
    }
}
```

- 实例化区块链，并且进入终端
```
geth --datadir="./" init genesisblock.json
geth --datadir="./" --networkid 23422  --rpc --rpccorsdomain="*" --rpcport="8545" --minerthreads="1" --mine --nodiscover --maxpeers=0 --unlock 0 console
```

### Node.js + Webpack

自行百度如何安装 Node.js + Webpack，此处不再赘述，提供一个简单的博客[教程](https://blog.csdn.net/ganyingxie123456/article/details/70176401)

#### 依赖包
注意，国内访问npm比较慢，可以切到淘宝镜像源，使用cnpm命令安装。
```
安装style-loader 和 css-loader
cnpm install style-loader
cnpm install css-loader

安装webpack-dev-server，版本：3.1.4
cnpm install webpack-dev-server@3.1.4

安装crypto-js
cnpm install crypto-js

安装ipfs-api
cnpm install ipfs-api
```

### 运行

1、启动IPFS服务 
打开终端，任意目录下输入：
ipfs daemon

2、开启Ethereum
切换到Geth的运行目录，输入以下命令进入eth控制台：
geth --datadir="./" --networkid 23422  --rpc --rpccorsdomain="*" --rpcport="8545" --minerthreads="1" --mine --nodiscover --maxpeers=0 --unlock 0 console

3、在工程的根目录下运行命令`npm run start`，在浏览器里输入：localhost:8080或者localhost:8081即可。
