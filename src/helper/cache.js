const { cache } = require('../config/defaultConfig')

const refreshRes = (stats, res) => {
  const { maxAge, expires, cacheControl, lastModified, etag } = cache

  if (expires) {
    // Expires 是超时的绝对时间 UTC 字符串
    res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString())
  }

  if (cacheControl) {
    res.setHeader('Cache-Control', `public, max-age: ${maxAge}`)
  }

  if (lastModified) {
    // 上次修改的绝对时间
    // 这里用 stats.mtime
    res.setHeader('Last-Modified', stats.mtime.toUTCString())
  }

  if (etag) {
    // 这里是简单用 stats 的 size 和 mtime 生成 etag
    res.setHeader('Etag', `${stats.size}-${stats.mtime.toUTCString()}`)
  }
}

module.exports = function isFresh(stats, req, res) {
  refreshRes(stats, res)

  // 协商缓存 请求头
  const lastModified = req.headers['if-modified-since']
  const etag = req.headers['if-none-match']

  if (!lastModified && !etag) {
    return false
  }

  // 客户端上次修改时间和服务器修改时间对比
  if (lastModified && lastModified !== res.getHeader('last-modified')) {
    return false
  }

  // 客户端带过来 etag 和服务器 etag 对比
  if (etag && etag !== res.getHeader('etag')) {
    return false
  }

  return true
}