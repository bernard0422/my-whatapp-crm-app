# Agentic Layer

## Risk Levels & Actions

### Low — auto-execute, no approval
- Tag a contact based on keyword history
- Score a lead (rule-based)
- Mark a message as `read`

### Medium — show draft, one-click approve
- Create a Lead from an inbound message
- Update Lead status to `qualified`
- Draft an order from message content

### High — explicit owner approval required
- **Send any WhatsApp message** (outbound via API)
- Trigger an AutoReply rule
- Create an Order with a total amount

### Critical — human only, never automated
- Issue a refund
- Delete a Contact or Order
- Modify Stripe subscription

## Named Tools (approved list)
- `whatsapp.send_message(contact_id, body)` — high risk
- `leads.create(contact_id, notes)` — medium risk
- `orders.create(contact_id, line_items)` — high risk
- `orders.update_status(order_id, status)` — medium risk
- `contacts.tag(contact_id, tags[])` — low risk

## Audit Log Fields
`id, user_id, action, entity_type, entity_id, payload_json, risk_level, approved_by, executed_at`

## v1 vs Later
**v1:** AutoReply engine only (keyword → send); all other actions owner-initiated.
**Later:** AI drafts reply suggestions (high-risk approval flow), lead scoring agent (low-risk auto).
