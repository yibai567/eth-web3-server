**简介** 快速和以太坊链进行沟通的 server
#### 主要用于 创建账号、发送合约交易等功能的测试
##### 文档编辑时间: 2017-08-22


## 依赖环境

### Node

```
node版本 >= 6.0.0
```

### Npm

```
npm版本 >= 5.0.0
```

### Python

```
Python版本 <= 2.7 (3.x.x不要安装3以上的版本) 此环境是以太坊web3在本地进行编译的时候需要的

```

## 启动区块链
```
geth --identity "test" --datadir data0 --networkid 899 --port 30303 --rpc --rpcaddr localhost --rpcport 8545 --rpcapi "web3" --rpccorsdomain "*" console 2>> data.log

# 参数说明
--datadir 使用那个目录作为数据目录
--networkid 网络ID 加入哪个网络
--port 连接端口
--rpc 启动RPC连接
--rpcaddr 连接该客户端的地址
--rpcport 连接该客户端的端口
--rpcapi  支持哪些接口调用
--rpccorsdomain 允许哪些域名请求 * 为所有请求
```

## 启动 Server

### 安装

```
在指定目录下执行:
cd $project

npm install --registry=https://registry.npm.taobao.org
```

### 配置

```
npm 安装完成之后进入 $project 目录中
用编辑器打开 config.js 文件进行相关配置:

const config = {
  // *** 注：本地以太坊节点的接口地址, 根据自己的环境修改
  ETHNodeHost: 'http://localhost:8545',

  // 合约地址, 固定值, 不需要改变
  ConstractAddress: '合约地址 eg: 0x4354tfsghs....',

  // 合约转账方法的签名, 固定值, 不需要改变
  ConstractMethodSgin: '0xa9059cbb',

  // 设置监听端口
  listenPort: 3000,

  // 设置hostname
  hostname: '127.0.0.1'
}


```

### 启动

```
node index.js

输出:
url地址: http:127.0.0.1:3000
server start successfully
```

## 使用方法

### 请求方式
```
使用能发送 http 请求的工具即可
```

### 接口
```
// 创建账号
createAccount
url:http://127.0.0.1:3000/createAccount
method: POST
Body:
  password: '密码' 推荐使用 32 个字符的随机密码 = 为了安全
```

```
// 获取账号列表
getAccounts
url: http://127.0.0.1:3000/createAccount
method: GET
Query:
```

```
// 获取余额
getBalance
url: http://127.0.0.1:3000/getBalance
method: GET
Query:
  address: '地址' 必填 要查询的账户地址
```

```
// 解锁账号
unlockAccount
url: http://127.0.0.1:3000/unlockAccount
method: POST
Body:
  address: '解锁账户地址' 必填
  password: '解锁账户密码' 必填
  timeout: '超时时间' 选填 默认60

```

```
// 发送合约交易
sendConstractTransaction
url: http://127.0.0.1:3000/sendConstractTransaction
method: POST
Body:
  from: '发送人地址'
  fromPassword: '发送人密码'
  to: '接受人地址'
  amount: '转账总额'
```

### 请求返回格式

#### 成功
```
返回格式
{
      code : 0,
      data : data
}
```

#### 失败
```
返回格式
{
    code : -1,
    data: {
      errorMessage: '错误信息'
    }
}
```

