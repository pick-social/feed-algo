# @pick-social/feed-algo

The open-source ranking algorithm behind the [pick.social](https://pick.social) feed.

## Why open source?

Feeds shape what you see. We think the rules deserve to be public. This package is a **pure function** — survey signals in, ordered feed out. No I/O, no tracking, no secrets. What you read here is exactly what runs in production: the app imports this package directly from GitHub.

## How it works

Each survey gets a score from four signals:

| Signal | Weight | What it measures |
|---|---|---|
| Freshness | 4.0 | Exponential decay, 18h half-life |
| Velocity | 3.0 | Votes in the last 24h (log-scaled) |
| Engagement | 1.5 | All-time votes (log-scaled) |
| Social | 2.0 | You follow the author |

Surveys you already voted on are heavily demoted (×0.15) — the feed's job is to ask your opinion, not echo it.

Weights are versioned in this repo: every tuning change is public via git history.

## Usage

```ts
import { rankFeed } from "@pick-social/feed-algo";

const ranked = rankFeed(surveySignals, Date.now());
```

## License

MIT
