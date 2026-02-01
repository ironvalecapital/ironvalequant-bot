// Simple script to post a single tweet (or reply) to X using OAuth 1.0a.
// This script is executed by the GitHub Actions workflow defined in
// .github/workflows/post.yml.  It reads environment variables for
// authentication and the tweet content.

import fetch from 'node-fetch';
import OAuth from 'oauth-1.0a';
import crypto from 'node:crypto';

// Read environment variables
const {
  // New environment variable names following X's consumer/bearer naming.
  CONSUMER_KEY,
  CONSUMER_SECRET,
  ACCESS_TOKEN,
  ACCESS_TOKEN_SECRET,
  BEARER_TOKEN,
  // Backwards-compatible variable names (for older secrets).
  X_API_KEY,
  X_API_SECRET,
  X_ACCESS_TOKEN,
  X_ACCESS_TOKEN_SECRET,
  TEXT,
  REPLY_TO,
} = process.env;

// Resolve credentials: prefer CONSUMER_KEY/SECRET and ACCESS_TOKEN/ACCESS_TOKEN_SECRET,
// but fall back to the legacy X_API_* variables for backwards compatibility.
const consumerKey = CONSUMER_KEY || X_API_KEY;
const consumerSecret = CONSUMER_SECRET || X_API_SECRET;
const accessToken = ACCESS_TOKEN || X_ACCESS_TOKEN;
const accessTokenSecret = ACCESS_TOKEN_SECRET || X_ACCESS_TOKEN_SECRET;

if (!TEXT || TEXT.trim().length === 0) {
  console.error('Error: TEXT environment variable must be provided.');
  process.exit(1);
}

// Validate that we have the necessary credentials.  Posting a tweet requires
// user-context authentication (OAuth 1.0a).  A bearer token alone cannot
// perform write operations.  See: https://developer.x.com/en/docs/twitter-api
if (!consumerKey || !consumerSecret) {
  console.error(
    'Error: Missing consumer key/secret. Set CONSUMER_KEY and CONSUMER_SECRET (or legacy X_API_KEY/X_API_SECRET).'
  );
  process.exit(1);
}
// If only a bearer token is provided (without user access credentials), exit.
if ((!accessToken || !accessTokenSecret) && BEARER_TOKEN) {
  console.error(
    'Error: Bearer tokens alone cannot post tweets. Please provide ACCESS_TOKEN and ACCESS_TOKEN_SECRET (or legacy X_ACCESS_TOKEN/X_ACCESS_TOKEN_SECRET) in addition to your bearer token.'
  );
  process.exit(1);
}
if (!accessToken || !accessTokenSecret) {
  console.error(
    'Error: Missing access token/secret. Set ACCESS_TOKEN and ACCESS_TOKEN_SECRET (or legacy X_ACCESS_TOKEN/X_ACCESS_TOKEN_SECRET).'
  );
  process.exit(1);
}

// Configure OAuth 1.0a
const oauth = new OAuth({
  consumer: { key: consumerKey, secret: consumerSecret },
  signature_method: 'HMAC-SHA1',
  hash_function(baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64');
  },
});

const token = {
  key: accessToken,
  secret: accessTokenSecret,
};

// Build request payload
const body = { text: TEXT };
if (REPLY_TO && REPLY_TO.trim().length > 0) {
  body.reply = { in_reply_to_tweet_id: REPLY_TO.trim() };
}

const requestData = {
  url: 'https://api.twitter.com/2/tweets',
  method: 'POST',
};

// Generate OAuth headers
const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

const headers = {
  ...authHeader,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function postTweet() {
  try {
    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers,
      body: JSON.stringify(body),
    });

    const responseBody = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseBody}`);
    }
    console.log('Tweet posted successfully:', responseBody);
  } catch (error) {
    console.error('Failed to post tweet:', error.message);
    process.exit(1);
  }
}

postTweet();