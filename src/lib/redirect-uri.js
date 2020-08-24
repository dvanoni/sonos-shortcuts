/**
 * Return the OAuth redirect URI based on the hostname
 *
 * @param {IncomingMessage} req
 */
module.exports = req => (
  `https://${req.headers['x-forwarded-host']}/api/create-token`
)
