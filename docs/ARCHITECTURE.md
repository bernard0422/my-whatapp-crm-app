# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database + Auth:** Supabase (Postgres, RLS, Storage)
- **Payments:** Stripe Checkout + webhooks
- **Messaging:** WhatsApp Business Cloud API (Meta)

## Now vs Later
**Now:** Webhook ingestion, Contact/Lead/Order CRUD, rule-based AutoReply, Order board, Stripe subscription gate, demo-visible dashboard.
**Later:** AI reply drafting, sentiment scoring, bulk broadcast, team inbox, mobile PWA.

## Key Action — Inbound WhatsApp Message Flow
1. Meta sends POST to `/api/whatsapp/webhook`
2. Edge function validates signature, upserts **Contact** (by phone), inserts **Message** row
3. AutoReply engine queries matching rules → if matched, calls WhatsApp Send API, inserts outbound **Message**
4. Dashboard live-updates via Supabase Realtime subscription
5. Owner opens conversation, clicks "Create Lead" → **Lead** row inserted, status = `new`
6. Owner clicks "Convert to Order" → **Order** row inserted, Lead status = `converted`
7. Owner marks Order `fulfilled` → revenue counter increments

## Layer Plan
1. **Data layer first** — tables, constraints, RLS policies, seed data
2. **App logic** — webhook handler, AutoReply engine, CRUD API routes
3. **Payments** — Stripe Checkout session, subscription status stored on user row
4. **Smart features** — AI reply drafting, lead scoring (post-v1)

## Core Without AI
All order-taking and auto-reply works on keyword rules stored in the database. Removing the AI layer leaves a fully functional tool.
