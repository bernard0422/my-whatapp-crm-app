# Tasks & Sprints

## Sprint 1 — Database & Demo Shell ✦ (start here)
**Goal:** Schema live, seed data visible, dashboard renders without login.
- [ ] Run migration SQL (all tables, RLS v1 policies, seed rows)
- [ ] Next.js project scaffold on Vercel, env vars wired
- [ ] Dashboard page `/` — today's messages, open leads, revenue — reads from Supabase, shows seed data
- [ ] Contacts list `/contacts` — table with name, phone, last message
- [ ] All pages: loading skeleton, empty state, error boundary
**Definition of Done:** Visiting `/` in a fresh browser (no login) shows seeded contacts, leads, and an order. No blank screens, no 500 errors.

## Sprint 2 — Core Engine: WhatsApp Webhook + AutoReply ✦ v1 functional milestone
**Goal:** Real WhatsApp messages flow in and trigger auto-responses.
- [ ] `POST /api/whatsapp/webhook` — verify token handshake, signature validation
- [ ] Inbound message handler: upsert Contact, insert Message row
- [ ] AutoReply engine: query matching rules, call WhatsApp Send API, insert outbound Message, log audit row
- [ ] AutoReply CRUD UI `/settings/autoreplies` — create, edit, toggle active, delete
- [ ] Conversation view `/contacts/[id]` — message thread, "Create Lead" button
- [ ] Create Lead flow → Lead row inserted, visible on `/leads`
- [ ] Lead → Order promotion: "Convert to Order" button, line-item entry, Order row inserted
- [ ] Order board `/orders` — kanban columns New / Confirmed / Fulfilled, drag-or-click status update
**Definition of Done:** Send a WhatsApp message to the test number → auto-reply arrives → dashboard shows new message → owner promotes to Lead → promotes to Order → marks Fulfilled. Every step persists to DB and survives a page refresh.

## Sprint 3 — Payments (Stripe)
**Goal:** Owner must subscribe to continue using the tool after free trial.
- [ ] Stripe product + price created in dashboard ($19/mo)
- [ ] `POST /api/stripe/checkout` — creates Checkout Session, returns URL
- [ ] `POST /api/stripe/webhook` — writes subscription status to `subscriptions` table
- [ ] Pricing page `/pricing` with "Subscribe" button
- [ ] Subscription status banner on dashboard (active / past_due / subscribe prompt)
- [ ] Gate: if no active subscription after 7-day trial, show paywall overlay (not a login wall)
**Definition of Done:** Click "Subscribe" → Stripe Checkout → complete test payment → return to app → subscription row status = 'active' → paywall gone. Stripe dashboard shows the charge.

## Sprint 4 — Lock It Down (Auth + Per-User RLS)
**Goal:** Each owner sees only their own data; anonymous access removed.
- [ ] Supabase Auth email/password signup + login pages
- [ ] On signup: write `user_id` to all owned rows going forward
- [ ] Replace v1 RLS policies with `auth.uid() = user_id` on every table
- [ ] WhatsApp webhook authenticates to a per-user token (stored in env / secrets table)
- [ ] Redirect unauthenticated users to `/login` (except `/pricing`)
**Definition of Done:** Log in as User A — cannot see User B's contacts or orders. Log out — dashboard redirects to login. Confirm in Supabase SQL editor that cross-user query returns 0 rows.

## Sprint 5 — Polish & Launch
- [ ] Onboarding checklist (connect WhatsApp number, add first AutoReply, invite first customer)
- [ ] Mobile-responsive layout
- [ ] Error alerting (Sentry or Vercel log drain)
- [ ] README: how to deploy, env vars, WhatsApp app setup
- [ ] Manual QA pass against TEST_PLAN.md

## Gantt
```
Week 1: Sprint 1 (Mon–Tue), Sprint 2 (Wed–Fri)
Week 2: Sprint 3 (Mon–Tue), Sprint 4 (Wed–Thu), Sprint 5 (Fri)
```
