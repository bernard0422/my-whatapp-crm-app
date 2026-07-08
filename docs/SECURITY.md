# Security

## Secrets
- `WHATSAPP_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — server-only env vars, never referenced in client bundles.
- Supabase `service_role` key used only in server-side API routes / Edge Functions.
- Public Supabase anon key is safe for client (RLS enforces access).

## Permission Model
- v1: permissive RLS (demo-first). Every table allows select + all for anonymous.
- Lock-down sprint: replace with `auth.uid() = user_id` policies. No data visible cross-user.
- Agents inherit the calling user's session — no elevated service-role calls from the frontend.

## Approved-Tools Rule
- Only the named tools in `AGENTIC_LAYER.md` may trigger external calls.
- No dynamic `eval`, no `run_any`, no `send_any`.
- Every outbound WhatsApp call logs a row in `audit_logs` before the HTTP request fires.

## Stripe
- Checkout sessions created server-side only.
- Subscription status written only via Stripe webhook (verified with `stripe.webhooks.constructEvent`).
- No payment data stored in Supabase — only `stripe_customer_id` and `stripe_subscription_id`.

## Honesty Note
Payments and WhatsApp API integration carry real financial and account-suspension risk. Before going live, have a human review the webhook security and Stripe webhook signing setup — do not skip this.
