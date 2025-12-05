const crypto = require('crypto')

function generateId() {
  // 12 random bytes -> base64url gives ~16 chars; slice to 16 for consistent length
  return crypto.randomBytes(12).toString('base64url').slice(0, 16)
}

module.exports = generateId
