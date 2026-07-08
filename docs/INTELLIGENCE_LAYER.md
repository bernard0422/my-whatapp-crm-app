# Intelligence Layer

## Messy Input
Raw WhatsApp message text: `"hi i want to order 2 nasi lemak for tomorrow pls"`

## Auto-Structure (rule-based v1)
```json
{
  "contact_phone": "+60123456789",
  "matched_keyword": "order",
  "auto_reply_triggered": true,
  "suggested_action": "create_lead"
}
```

## Events to Track
- Message received
- AutoReply fired (which rule, latency)
- Lead created / status changed
- Order created / fulfilled
- Subscription started / lapsed

## Scoring Rules (v1 — rule-based)
| Signal | Points |
|---|---|
| Has placed an order before | +30 |
| Message contains order keyword | +20 |
| Replied within 10 min of auto-reply | +15 |
| No prior contact | 0 |

Score 0–100; stored per Lead. Thresholds: <30 cold, 30–60 warm, >60 hot.

## What Gets Ranked
- Leads sorted by score descending on dashboard
- AutoReply rules sorted by most-triggered (owner can see what's working)

## v1 vs Later
**v1:** keyword match + rule-based scoring
**Later:** LLM intent extraction, draft reply suggestions, churn-risk flag on stale leads
