create table route_stats (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp default now(),
  athlete_id bigint not null references athletes(id) on delete cascade,
  route_id text not null references routes(id) on delete cascade,
  covered_length float not null
);

ALTER TABLE route_stats ADD UNIQUE(athlete_id, route_id);
