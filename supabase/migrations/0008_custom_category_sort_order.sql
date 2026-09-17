-- Phase 5.2: preserve the student's custom category order without touching
-- transaction records. NULL keeps categories created before this migration in
-- their existing creation order until the user reorders them.
alter table if exists public.custom_categories
  add column if not exists sort_order integer;
