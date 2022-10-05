create table intersections (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp default now(),
  activity_id bigint not null references activities(id) on delete cascade,
  route_id text not null references routes(id) on delete cascade,
  intersection_track geography(linestring) not null
);
