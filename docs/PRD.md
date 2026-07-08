# PRD — WhatsApp CRM

## Problem
Small business owners (food, crafts, services) run sales entirely on WhatsApp but have no structure: orders get lost in chat, follow-ups are forgotten, and there is no way to see pipeline or revenue at a glance.

## Target User
Sole-trader or micro-team owner who already takes orders via WhatsApp and wants to stop losing money to disorganisation — not a tech-savvy user, not a corporate team.

## Core Objects
- **Contact** — a customer record linked to a WhatsApp number
- **Lead** — a potential order being qualified
- **Order** — a confirmed purchase with line items and status
- **Message** — inbound/outbound WhatsApp message, linked to a Contact
- **AutoReply** — a saved rule that triggers a canned response on a keyword match

## MVP Must-Haves
- [ ] WhatsApp webhook receives inbound messages and creates/updates Contacts
- [ ] Keyword-based AutoReply sends an instant response (e.g. "price" → price list)
- [ ] Owner can manually promote a conversation to a Lead, then to an Order
- [ ] Order board shows pipeline: New → Confirmed → Fulfilled
- [ ] Stripe checkout lets a new user subscribe (one paid tier, $19/mo)
- [ ] Dashboard shows today's new messages, open leads, and revenue

## Non-Goals (v1)
- Calendar / appointment scheduling
- Multi-agent / team inbox
- AI-generated replies (v1 is rule-based only)
- Mobile app

## Success Criteria
A business owner receives a WhatsApp message → the system auto-replies with the price list → they open the dashboard, convert the conversation to an Order → mark it Fulfilled → Stripe has charged them $19 for the month. End-to-end, no manual coding steps required.
