// 请求头 Range:bytes=start-end

// 响应头 Content-Range: bytes start-end/total
//       Conetnt-Length: total

module.exports = (totalSize, req, res) => {
  const range = req.headers['range']

  if (!range) {
    return {code: 200}
  }

  const size = range.match(/bytes=(\d*)-(\d*)/)
  const end = size[2] ? parseInt(size[2]) : totalSize - 1
  const start = size[1] ? parseInt(size[1]) : totalSize - end

  if (end < start || start < 0 || end > totalSize) {
    return {code: 200}
  }

  res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`)
  res.setHeader('Content-Length', end - start)

  // 说明是部分内容请求，statusCode 206
  return {
    code: 206,
    start,
    end
  }
}
