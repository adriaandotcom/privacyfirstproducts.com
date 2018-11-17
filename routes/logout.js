module.exports = {
  get: async (req, res) => {
    const now = new Date()
    const time = now.getTime()
    now.setTime(time - 100000000)

    res.writeHead(302, {
      'Set-Cookie': `token='';expires=${now.toGMTString()};path=/`,
      Location: '/' })
    return res.end()
  }
}
