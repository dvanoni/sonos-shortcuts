const https = require('https')
const querystring = require('querystring')

/**
 * Refresh Token
 *
 * @see https://developer.sonos.com/reference/authorization-api/refresh-token/
 */
module.exports = (req, res) => {
  const { refresh_token } = req.body

  const postData = querystring.stringify({
    grant_type: 'refresh_token',
    refresh_token,
  })

  const options = {
    auth: `${process.env.SONOS_CLIENT_ID}:${process.env.SONOS_CLIENT_SECRET}`,
    host: 'api.sonos.com',
    path: '/login/v3/oauth/access',
    method: 'POST',
    headers: {
      'Content-Length': Buffer.byteLength(postData),
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  }

  const tokenReq = https.request(
    options,
    tokenRes => {
      let data = ''
      tokenRes.on('data', chunk => {
        data += chunk
      })
      tokenRes.on('end', () => {
        if (tokenRes.statusCode !== 200) {
          // Error occurred
          res.status(tokenRes.statusCode)
        }
        res.setHeader('Content-Type', 'application/json')
        res.send(data)
      })
    }
  )

  tokenReq.write(postData)
}
