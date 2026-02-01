// Simple script to post a single tweet (or reply) to X using OAuth 1.0a.
// This script is executed by the GitHub Actions workflow defined in
// .github/workflows/post.yml.  It reads environment variables for
// authentication and the tweet content.

import fetch from 'node-fetch';
import OAuth from 'oauth-1.0a';
import crypto from 'node:crypto';

// Read environment variables
const {
  X_API_KEY,
  X_API_SECRET,
  X_ACCESS_TOKEN,
  X_ACCESS_TOKEN_SECRET,
  TEXT,
  REPLY_TO,
} = process.env;

if (!TEXT || TEXT.trim().length === 0) {
  console.error('Error: TEXT environment variable must be provided.');
  process.exit(1);
}

// Configure OAuth 1.0a
const oauth = new OAuth({
  consumer: { key: X_API_KEY, secret: X_API_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64');
  },
});

const token = {
  key: X_ACCESS_TOKEN,
  secret: X_ACCESS_TOKEN_SECRET,
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