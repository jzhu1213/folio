-- Phase 2.5: persist management metadata without touching transaction rows.
-- Archived categories are hidden from active pickers, while transactions keep
-- their existing category values and remain intact.
alter table if exists public.custom_categories
  add column if not exists archived boolean not null default false,
  add column if not exists color text,
  add column if not exists illustration text;
