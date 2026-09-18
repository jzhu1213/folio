-- Phase 6.2: a soft, user-controlled subscription usage signal. It does not
-- affect activity, runway math, or the recurring-charge transaction link.
alter table public.recurring_charges
  add column if not exists is_flagged_unused boolean not null default false;
