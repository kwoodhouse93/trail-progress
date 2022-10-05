create table refresh_tokens (
  athlete_id bigint primary key references athletes(id) on delete cascade,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  refresh_token text not null
);
