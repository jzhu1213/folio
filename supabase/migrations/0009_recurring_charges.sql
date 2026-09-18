-- Phase 6.1: first-class recurring obligations. Transactions remain the
-- historical occurrence ledger and continue to use recurring_id as the link.
create table if not exists public.recurring_charges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  amount numeric(12,2) not null check (amount > 0),
  frequency text not null default 'monthly'
    check (frequency in ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  next_due_date date not null,
  obligation_type text not null default 'fixed'
    check (obligation_type in ('fixed', 'variable')),
  is_subscription boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recurring_charges_user_active
  on public.recurring_charges(user_id, is_active, next_due_date);

alter table public.recurring_charges enable row level security;
drop policy if exists "Users manage own recurring charges" on public.recurring_charges;
create policy "Users manage own recurring charges" on public.recurring_charges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Promote Phase 2.6 transaction-level flags where a UUID link exists. The
-- charge reuses recurring_id, so historic and future transaction occurrences
-- remain linked to the new canonical record without duplicating a concept.
insert into public.recurring_charges (
  id, user_id, name, category, amount, frequency, next_due_date,
  obligation_type, is_subscription, is_active
)
select distinct on (t.user_id, t.recurring_id)
  t.recurring_id,
  t.user_id,
  coalesce(nullif(trim(t.note), ''), initcap(replace(t.category, '_', ' '))),
  t.category,
  t.amount,
  'monthly',
  t.date,
  case when t.category in ('rent', 'subscriptions') then 'fixed' else 'variable' end,
  t.category = 'subscriptions',
  true
from public.transactions t
where t.is_recurring = true and t.recurring_id is not null and t.type = 'expense'
order by t.user_id, t.recurring_id, t.date desc
on conflict (id) do nothing;

-- Flagged transactions without an older recurring_id are also promoted. Each
-- one receives a charge and is linked immediately, rather than leaving an
-- unconnected transaction-level flag behind.
with legacy as (
  select
    t.id as transaction_id,
    gen_random_uuid() as charge_id,
    t.user_id,
    coalesce(nullif(trim(t.note), ''), initcap(replace(t.category, '_', ' '))) as name,
    t.category,
    t.amount,
    t.date,
    case when t.category in ('rent', 'subscriptions') then 'fixed' else 'variable' end as obligation_type,
    t.category = 'subscriptions' as is_subscription
  from public.transactions t
  where t.is_recurring = true and t.recurring_id is null and t.type = 'expense'
), inserted as (
  insert into public.recurring_charges (
    id, user_id, name, category, amount, frequency, next_due_date,
    obligation_type, is_subscription, is_active
  )
  select charge_id, user_id, name, category, amount, 'monthly', date,
    obligation_type, is_subscription, true
  from legacy
  returning id
)
update public.transactions t
set recurring_id = legacy.charge_id
from legacy
where t.id = legacy.transaction_id;
