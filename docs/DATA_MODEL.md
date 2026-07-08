# Data Model

## contacts
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | owner (set at lock-down) |
| phone | text not null | WhatsApp number E.164 |
| name | text | |
| wa_profile_name | text | from Meta profile |
| tags | text[] | |
| created_at | timestamptz | |

## messages
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| contact_id | uuid → contacts | |
| direction | text | 'inbound'/'outbound' |
| body | text | |
| wa_message_id | text | Meta message ID |
| replied_by_rule | uuid nullable | → auto_replies |
| created_at | timestamptz | |

## leads
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| contact_id | uuid → contacts | |
| status | text | 'new','qualified','converted','lost' |
| notes | text | |
| created_at | timestamptz | |

## orders
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| contact_id | uuid → contacts | |
| lead_id | uuid nullable → leads | |
| status | text | 'new','confirmed','fulfilled','cancelled' |
| line_items | jsonb | [{name, qty, price}] |
| total_amount | numeric | |
| notes | text | |
| created_at | timestamptz | |

## auto_replies
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| keyword | text | case-insensitive match |
| response_text | text | message to send |
| active | boolean default true | |
| created_at | timestamptz | |

## subscriptions
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| stripe_customer_id | text | |
| stripe_subscription_id | text | |
| status | text | 'active','past_due','cancelled' |
| plan | text | 'starter' |
| current_period_end | timestamptz | |
| created_at | timestamptz | |

## AI Fields (future lead scoring)
Any AI-generated `lead_score` will store: `lead_score numeric`, `lead_score_source text`, `lead_score_confidence numeric`, `lead_score_review_status text default 'unreviewed'`.

## RLS
v1: permissive read+write for demo. Lock-down sprint: all tables filter `auth.uid() = user_id`.
