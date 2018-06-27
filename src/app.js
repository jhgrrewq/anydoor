// 构建静态文件服务器，判断请求 url，如果是文件返回内容，如果是目录，返回该目录下文件列表

/**
 * http.createServer([requestListener]) 返回一个http.server实例，requestListener是一个函数，会自动添加到request事件中，也就是每次请求进来，都会调用该函数
 * res.statusCode
 * res.setHeader(key,value)
 * res.writeHeader(statusCode, {
 *  'Content-type': ''  // headers
 * })
 * res.write()
 * res.end()
 *
 * server.listen()
 * */

const http = require('http');
const chalk = require('chalk');
const path = require('path');
const conf = require('./config/defaultConfig');
const route = require('./helper/route');

class Server {
  constructor(config) {
    this.conf = Object.assign({}, conf, config);
  }

  start() {
    // 注意 this 指定，回调使用箭头函数
    const server = http.createServer((req, res) => {
      const filePath = path.join(this.conf.root, req.url)
      route(req, res, filePath, this.conf)
    })
    
    server.listen(this.conf.port, this.conf.hostname, () => {
      const info = `http://${this.conf.hostname}:${this.conf.port}`
      console.log(`The server is listening at ${chalk.green(info)}`)
    })
  }
}

module.exports = Server