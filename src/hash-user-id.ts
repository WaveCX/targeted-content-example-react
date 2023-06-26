// In production, user IDs should be hashed server side and sent to the client.
// The signing secret should never be sent to or stored on the client.

import crypto from 'crypto-js';

const signingSecret = process.env['REACT_APP_HASH_SECRET'] ?? '';

export const hashUserId = (userId: string): string =>
  crypto.HmacSHA256(userId, signingSecret).toString();