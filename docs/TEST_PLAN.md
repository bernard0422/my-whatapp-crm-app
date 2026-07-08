# Test Plan

## Core Success Scenario (manual, end-to-end)
1. Open `/` — dashboard loads with seed contacts, leads, revenue counter. No login required.
2. Send a WhatsApp message containing the word "price" to the test number.
3. Confirm auto-reply arrives in WhatsApp within 5 seconds.
4. Refresh `/` — new Message row visible in today's feed.
5. Open `/contacts/[id]` — message thread shows inbound + outbound messages.
6. Click "Create Lead" — Lead appears in `/leads` with status `new`.
7. Open lead, click "Convert to Order", enter 2 × Nasi Lemak @ RM8 — Order created, total = RM16.
8. On `/orders` board, drag Order to "Confirmed", then "Fulfilled" — status updates persist on refresh.
9. Go to `/pricing`, click Subscribe, use Stripe test card 4242 4242 4242 4242.
10. Return to app — subscription row shows `active`, paywall banner gone.

## Empty States
- New install with no messages: dashboard shows zero-state illustration + "Send your WhatsApp link to a customer" prompt.
- No AutoReply rules: `/settings/autoreplies` shows empty state + "Add your first rule" CTA.
- No orders: `/orders` board shows empty columns, not blank white.

## Error Cases
- Invalid WhatsApp webhook signature → 403 returned, no DB write, audit log entry with `action=webhook_rejected`.
- Stripe webhook with wrong secret → 400, no subscription row written.
- WhatsApp Send API fails → outbound Message row inserted with `status=failed`, owner sees error toast.
- DB unreachable → all pages show error boundary "Something went wrong — try again" (not a crash).

## Permission Check (post Sprint 4)
- Log in as User B, attempt `GET /api/contacts?user_id=<User A's id>` — returns 0 rows.
- Supabase SQL: `select * from orders where user_id = '<User A>'` as User B role → 0 rows.
