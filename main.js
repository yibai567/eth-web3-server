const express = require('express')
const rawBodyParser = require('raw-body-parser')
const config = require('./config')
const Web3 = require('web3')

const app = express()

// *** 注：本地以太坊节点的接口地址, 根据自己的环境修改
let ETHNodeHost = config.ETHNodeHost

// 你的合约地址
let ConstractAddress = config.ConstractAddress

// 合约转账方法的签名, 固定值(你的合约对应生成时可以得到)
let ConstractMethodSgin = config.ConstractMethodSgin

// 本地 Server 设置监听端口
let listenPort = config.listenPort

// 设置 hostname
let hostname = config.hostname

// 创建与链沟通的 web3 实例
const web3 = new Web3(new Web3.providers.HttpProvider(ETHNodeHost))

app.use(rawBodyParser())

// 定义server的方法
app.post('/createAccount', createAccount)
app.post('/unlockAccount', unlockAccount)
app.get('/getAccounts', getAccounts)
app.get('/getBalance/:address', getBalance)
app.post('/sendConstractTransaction', sendConstractTransaction)

/**
 * createAccount
 * 创建账户
 *
 * @method POST
 * @param  password 密码, 推荐使用 32 个字符的随机密码
 * @return address
 */
function createAccount (req, res, next) {
  // 获取请求参数
  try {
    let resBody = req.rawBody.toString('utf8')
    let resData = JSON.parse(resBody)
    let password = resData.password;

    web3.eth.personal.newAccount(password)
      .then(address => {
        console.log(address)
        return successResponse(res, address)
      })
      .catch(errorResult => {
        console.log(errorResult)
        return faildResponse(res, errorResult)
      })
  } catch (e) {
    console.log('[debug createAccount] request e', e)
    return faildResponse(res, 'bode parse error')
  }
}

/**
 * getAccounts
 * 获取账户列表
 *
 * @method  GET
 * @return accounts
 */
function getAccounts (req, res, next) {
  web3.eth.getAccounts()
    .then(accounts => {
        console.log(accounts)
        return successResponse(res, accounts)
    })
    .catch(errorResult => {
      console.log('[debug getAccounts] request e', e)
      return faildResponse(res, 'bode parse error')
    })
}

/**
 * getBalance
 * 获取余额
 *
 * @method  GET
 * @param   address 账户地址
 * @return  balance
 */
function getBalance (req, res, next) {
  // 获取请求参数
  try {
      let address = req.params.address

      // 获取余额信息
      web3.eth.getBalance(address)
      .then(balance => {
        console.log(balance)

          return successResponse(res, balance)
      })
      .catch(errorResult => {
        console.log(errorResult)

        return faildResponse(res, errorResult)
      })
  } catch (e) {
      console.log('[debug getBalance] request e', e)
      return faildResponse(res, 'bode parse error');
  }
}

/**
 * unlockAccount
 * 解锁账户地址
 *
 * @method  POST
 * @param   address 账户地址
 * @param   password 账户密码(创建账户是填写的)
 * @return  bool
 */
function unlockAccount (req, res, next) {
  // 获取请求参数
  try {
    let resBody = req.rawBody.toString('utf8')
    let resData = JSON.parse(resBody)

    let address = resData.address
    let password = resData.password
    let timeout = resData.timeout
    // 默认设置账户解锁时间 60 秒, 可按需求自行更改
    if (!timeout) {
      timeout = 60
    }

    // 解锁账户
    web3.eth.personal.unlockAccount(address, password, timeout)
      .then((result) => {
        console.log(result)
        if (result) {
          return successResponse(res, 'unlockAccount is success')
        } else {
          return faildResponse(res, 'unlockAccount is fail')
        }
      })
      .catch(errorResult => {
        console.log(errorResult)
        return faildResponse(res, 'bode parse error')
      })
  } catch (e) {
      console.log('[debug unlockAccount] request e', e)
      return faildResponse(res, 'bode parse error')
  }
}

/**
 * sendConstractTransaction
 * 使用合约发送合约交易, 内置解锁流程
 *
 * @method  POST
 * @param   from 发送人地址
 * @param   fromPassword 发送人密码(创建账户是填写的)
 * @param   to 接受人地址
 * @param   int amount 转账总额
 * @return  hash 交易的 hash
 */
function sendConstractTransaction(req, res, next) {
  // 获取请求参数
  try {
      let resBody = req.rawBody.toString('utf8')
      let resData = JSON.parse(resBody)

      var from = resData.from
      var fromPassword = resData.fromPassword
      var to = resData.to
      var amount = resData.amount

      // 准备合约交易数据
      let hexAmount = web3.utils.toHex(amount);

      let paramsEncode = web3.eth.abi.encodeParameters(['address', 'uint256'], [to, amount])
      let data = paramsEncode.replace(/0x/, ConstractMethodSgin)

      let params = {
          from: from,
          to: ConstractAddress,
          amount: hexAmount,
          data: data
      }

      console.log(params);

      // 解锁账户 解锁有效时长60秒
      web3.eth.personal.unlockAccount(from, fromPassword, 60)
        .then((result) => {
          if (result) {
            // 发送交易
            console.log(params);
            web3.eth.sendTransaction(params, (error, hash) => {
              console.log(error, hash)
              if (!error) {
                return successResponse(res, hash)
              }
            })
            .on('transactionHash', function(hash){
              return successResponse(res, hash)
              console.log(hash)
            })
            .on('receipt', function(receipt){
              console.log(receipt)
            })
            .on('confirmation', function(confirmationNumber, receipt){
              console.log(confirmationNumber, receipt)
            })
            .on('error', console.log);
          } else {
              console.log(result)
              return faildResponse(res, 'unlockAccount is fail')
          }
        })
        .catch(errorResult => {
          console.log(errorResult)
          return faildResponse(res, 'bode parse error')
        })

  } catch (e) {
      return faildResponse(res, 'bode parse error');
  }
}

/**
 * 失败的响应
 */
function faildResponse (resObj, errorMessage, code) {
  if (!code) {
    code = -1
  }

  let responseData = {
    code,
    data: {
      errorMessage
    }
  }

  responseData = JSON.stringify(responseData)
  resObj.send(responseData)
  return resObj.end()
}

/**
 * 成功的响应
 */
function successResponse (resObj, data) {
  if (!data) {
      data = {}
  }

  let responseData = {
      code : 0,
      data : data
  }

  responseData = JSON.stringify(responseData)
  resObj.send(responseData)
  return resObj.end()
}

// 监听端口 在config里面进行设置
app.listen(listenPort, hostname)
console.log(`url地址: http://${hostname}:${listenPort}`)
console.log('server start successfully')
