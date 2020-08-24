const querystring = require('querystring')
const redirectUri = require('../lib/redirect-uri')

/**
 * Create Authorization Code
 *
 * @see https://developer.sonos.com/reference/authorization-api/create-authorization-code/
 */
module.exports = (req, res) => {
  const { shortcut_name } = req.query

  if (!shortcut_name) {
    return res.status(422).json({ error: 'Missing required param `shortcut_name`' })
  }

  const params = querystring.stringify({
    client_id: process.env.SONOS_CLIENT_ID,
    response_type: 'code',
    state: shortcut_name,
    scope: 'playback-control-all',
    redirect_uri: redirectUri(req),
  })

  // Redirect to Sonos OAuth
  res.setHeader('Location', `https://api.sonos.com/login/v3/oauth?${params}`)
  res.status(303)
  res.end()
}
