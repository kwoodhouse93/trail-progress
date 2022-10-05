create type status as enum ('not_started', 'started', 'complete');

create table athletes (
  id bigint primary key,
  created_at timestamp default now(),
  backfill_status status not null default 'not_started'
);
