create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  phone text not null,
  name text,
  wa_profile_name text,
  tags text[],
  created_at timestamptz not null default now()
);

alter table contacts enable row level security;
drop policy if exists "contacts_v1_read" on contacts;
create policy "contacts_v1_read" on contacts for select using (true);
drop policy if exists "contacts_v1_write" on contacts;
create policy "contacts_v1_write" on contacts for all using (true) with check (true);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  contact_id uuid references contacts(id),
  direction text not null,
  body text,
  wa_message_id text,
  replied_by_rule uuid,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;
drop policy if exists "messages_v1_read" on messages;
create policy "messages_v1_read" on messages for select using (true);
drop policy if exists "messages_v1_write" on messages;
create policy "messages_v1_write" on messages for all using (true) with check (true);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  contact_id uuid references contacts(id),
  status text not null default 'new',
  notes text,
  lead_score numeric,
  lead_score_source text,
  lead_score_confidence numeric,
  lead_score_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);

alter table leads enable row level security;
drop policy if exists "leads_v1_read" on leads;
create policy "leads_v1_read" on leads for select using (true);
drop policy if exists "leads_v1_write" on leads;
create policy "leads_v1_write" on leads for all using (true) with check (true);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  contact_id uuid references contacts(id),
  lead_id uuid references leads(id),
  status text not null default 'new',
  line_items jsonb,
  total_amount numeric,
  notes text,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;
drop policy if exists "orders_v1_read" on orders;
create policy "orders_v1_read" on orders for select using (true);
drop policy if exists "orders_v1_write" on orders;
create policy "orders_v1_write" on orders for all using (true) with check (true);

create table if not exists auto_replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  keyword text not null,
  response_text text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table auto_replies enable row level security;
drop policy if exists "auto_replies_v1_read" on auto_replies;
create policy "auto_replies_v1_read" on auto_replies for select using (true);
drop policy if exists "auto_replies_v1_write" on auto_replies;
create policy "auto_replies_v1_write" on auto_replies for all using (true) with check (true);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'trialing',
  plan text not null default 'starter',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;
drop policy if exists "subscriptions_v1_read" on subscriptions;
create policy "subscriptions_v1_read" on subscriptions for select using (true);
drop policy if exists "subscriptions_v1_write" on subscriptions;
create policy "subscriptions_v1_write" on subscriptions for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  payload_json jsonb,
  risk_level text,
  approved_by uuid,
  executed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into contacts (id, phone, name, wa_profile_name, tags) values
  ('a1000000-0000-0000-0000-000000000001', '+60123456001', 'Siti Rahimah', 'Siti R', array['repeat-customer']),
  ('a1000000-0000-0000-0000-000000000002', '+60198765002', 'Ahmad Fauzi', 'Fauzi', array['new']),
  ('a1000000-0000-0000-0000-000000000003', '+60112233003', 'Priya Nair', 'Priya', array['vip']),
  ('a1000000-0000-0000-0000-000000000004', '+60177654004', 'Hafiz Zain', 'Hafiz', array['new']);

insert into messages (contact_id, direction, body, wa_message_id) values
  ('a1000000-0000-0000-0000-000000000001', 'inbound', 'Hi, boleh tahu harga nasi lemak?', 'wamid.demo001'),
  ('a1000000-0000-0000-0000-000000000001', 'outbound', 'Hi Siti! Nasi lemak kami RM8 sepinggan. Free delivery above RM40 🎉', 'wamid.demo002'),
  ('a1000000-0000-0000-0000-000000000002', 'inbound', 'I want to order 3 portions for tomorrow', 'wamid.demo003'),
  ('a1000000-0000-0000-0000-000000000003', 'inbound', 'Price list please', 'wamid.demo004'),
  ('a1000000-0000-0000-0000-000000000004', 'inbound', 'Do you deliver to Subang?', 'wamid.demo005');

insert into leads (id, contact_id, status, notes, lead_score) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'new', 'Wants 3 portions tomorrow', 65),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'qualified', 'VIP customer, asked for price list', 80);

insert into orders (contact_id, lead_id, status, line_items, total_amount, notes) values
  ('a1000000-0000-0000-0000-000000000001', null, 'fulfilled', '[{"name":"Nasi Lemak","qty":5,"price":8}]', 40, 'Delivered Monday'),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'confirmed', '[{"name":"Nasi Lemak","qty":10,"price":8},{"name":"Teh Tarik","qty":10,"price":3}]', 110, 'Catering order Friday');

insert into auto_replies (keyword, response_text, active) values
  ('price', 'Hi! Here is our menu: Nasi Lemak RM8, Mee Goreng RM7, Teh Tarik RM3. Min order RM20. Reply with your order! 🍛', true),
  ('order', 'Great, you want to place an order! Please tell us: item name, quantity, and delivery address. We will confirm shortly.', true),
  ('delivery', 'We deliver within 10km of Petaling Jaya. Free delivery above RM40, otherwise RM5 flat fee.', true);