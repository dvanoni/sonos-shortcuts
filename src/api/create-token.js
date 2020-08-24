const https = require('https')
const querystring = require('querystring')
const redirectUri = require('../lib/redirect-uri')

/**
 * Create Token
 *
 * @see https://developer.sonos.com/reference/authorization-api/create-token/
 */
module.exports = (req, res) => {
  // `state` should contain the name of the shortcut to open
  const { state, code, error } = req.query

  if (error) {
    return res.status(422).json({ error })
  }

  const postData = querystring.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri(req),
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

  /**
   * Redirect to iOS Shortcuts with data encoded in base64
   *
   * @param {string} data
   *
   * @see https://support.apple.com/en-gb/guide/shortcuts/apd624386f42/3.5/ios/13.5
   */
  const handleSuccess = data => {
    const params = querystring.stringify({
      name: state,
      input: 'text',
      text: Buffer.from(data).toString('base64'),
    })
    res.setHeader('Location', `shortcuts://run-shortcut?${params}`)
    res.status(303)
    res.end()
  }

  const tokenReq = https.request(
    options,
    tokenRes => {
      let data = ''
      tokenRes.on('data', chunk => {
        data += chunk
      })
      tokenRes.on('end', () => {
        if (tokenRes.statusCode === 200) {
          return handleSuccess(data)
        }
        // Error occurred
        res.setHeader('Content-Type', 'application/json')
        return res.status(tokenRes.statusCode).send(data)
      })
    }
  )

  tokenReq.write(postData)
}
