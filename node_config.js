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

module.exports = config
