const yargs = require('yargs')
const Server = require('./app')

const argv = yargs
  .usage('anydoor [options]')
  .options('p', {
    alias: 'port',
    describe: '端口号',
    default: 9527
  })
  .options('h', {
    alias: 'hostname',
    describe: '主机名',
    default: '127.0.0.1'
  })
  .options('d', {
    alias: 'root',
    describe: '根目录',
    default: process.cwd()
  })
  .version()
  .alias('v', 'version')
  .help()
  .argv

const server = new Server(argv)
server.start()