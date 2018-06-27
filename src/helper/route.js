// async/await await 后面如果跟着 promise 会等回 promise resolve 结果
// 异步变同步书写 async/await 异步封装成 promise

const Handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const mime = require('./mime')
const compressFile = require('./compress')
const range = require('./range')
const isFresh = require('./cache')
const { promisify } = require('util')
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)

// 处理模板
const tpl = '../template/dir.html'
const fileTplPath = path.join(__dirname, tpl) // 将模板路径处理为绝对路径
const source = fs.readFileSync(fileTplPath, 'utf8') // 同步读取模板，首先是因为需要编译成模板才能渲染数据，其次放在函数外只需要编译一次，node的require下次就会从缓存加载
const template = Handlebars.compile(source) // 编译模板

module.exports = async function(req, res, filePath, config) {
  try {
    const stats = await stat(filePath)
    if (stats.isFile()) {
      // 如果是文件返回文件内容
      const mimeType = mime(filePath)
      res.setHeader('Content-Type', mimeType)
      
      if (isFresh(stats, req, res)) {
        // 协商缓存有效，直接返回状态码 304 响应体为空的响应
        res.statusCode = 304
        res.end()
        return
      }
      
      let rs
      const { code, start, end } = range(stats.size, req, res)

      if (code === 200) {
        res.statusCode = 200
        rs = fs.createReadStream(filePath)
      } else if (code === 206) {
        res.statusCode = 206
        // 读取部分流
        rs = fs.createReadStream(filePath, { start, end })
      }

      if (config.compress.test(filePath)) {
        rs = compressFile(rs, req, res)
      }

      rs.pipe(res)
      // fs.readFile(filePath, (err, data) => {
      //     res.end(data.toString())
      // })  // 将文件全部读入内存再返回 太慢
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath)
      const dir = path.relative(config.root, filePath) // 返回从 root 进入到 filePath 的相对路径
      const data = {
        dir: dir ? `/${dir}` : '', // 需要加上相对网站的根路径
        files: files.map(file => {
          // es6 箭头函数返回 对象
          return {
            icon: mime(file),
            file
          }
        })
      }
      res.writeHeader(200, {
        'Content-Type': 'text/html'
      })
      res.end(template(data))
    }
  } catch (error) {
    res.writeHeader(404, {
      'Content-Type': 'text/html'
    })
    res.end(`${filePath} is not a file or a directory !`)
  }
}