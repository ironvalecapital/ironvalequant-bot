# IronvaleQuant Bot (Manual posting)

This repository provides two ways to post updates to the IronvaleQuant account on X/Twitter:

1. **Automated daily updates** using `bot.py` (from the Python script in the separate `ironvale-quant-x-bot` project).  This script performs gold/silver analysis and posts results via a scheduled GitHub Action.
2. **Manual postings** using the Node script `post.js` or the Python script located in this directory.  These allow you to post custom messages or threads via a repository dispatch or the GitHub Actions UI.

## Sample message

The `messages` directory contains examples of structured messages you can post.  For instance, `week_ahead_feb1_2026.json` contains a tweet and a two‑part thread:

```json
{
  "tweet": "IronvaleQuant — Week Ahead (Feb 1 ’26)\nMacro state leans risk‑on but watch liquidity & earnings. Tech & defence are focus areas and emerging markets show momentum on softer USD. We look for stocks above key WMAs with volatility compression pointing to breakouts. (Not financial advice)",
  "thread": [
    "1/ Key levels & signals: Trend is defined by price vs WMA34/89/200; near 33‑bar highs hints at breakout, near lows at breakdown. Tight ranges & VCP compression suggest expansion. Derivative thinking: slopes & momentum shifts drive direction.",
    "2/ Psychology & risk: Trade only when quality score meets threshold, limit trades per week, respect stop‑loss & cooldown. Distribution thinking: evaluate macro regimes & probabilities rather than single‑point forecasts. No specific trades advised."
  ]
}
```

### Posting via Python

To post this message with threads using the included Python script, pipe the JSON into the script.  For example:

```bash
cat messages/week_ahead_feb1_2026.json | python "bot.py (posts threads + saves archive file)"
```

The script reads the `tweet` and `thread` values, adds a timestamped header, and posts each segment as a reply to the previous one.  Ensure your `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, and `X_ACCESS_SECRET` are set in your environment (e.g., via GitHub repository secrets) before running.

### Posting via Node script

If you only want to post the first part of the message, copy the `tweet` string from the JSON file and paste it into the `text` field when running the **Post to X (IronvaleQuant)** workflow.  The Node script `post.js` posts a single tweet using your credentials.

### Repository secrets

Both posting methods require valid X/Twitter API credentials.  In your GitHub repository:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**.
2. Add secrets named `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, and `X_ACCESS_TOKEN_SECRET` with your credential values.  This allows the GitHub Actions workflows and scripts to authenticate.
