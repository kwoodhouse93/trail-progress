create table access_tokens (
  athlete_id bigint primary key references athletes(id) on delete cascade,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  access_token text not null,
  expires_at timestamp not null
);
