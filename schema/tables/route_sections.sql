create table route_sections (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp default now(),
  activity_id bigint not null references activities(id) on delete cascade,
  route_id text not null references routes(id) on delete cascade,
  section_track geography(linestring) not null
);
