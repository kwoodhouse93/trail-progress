CREATE TABLE activities (
    id bigint primary key,
    inserted_at timestamp without time zone DEFAULT now(),
    athlete_id bigint NOT NULL references athletes(id) on delete cascade,
    name text,
    distance double precision,
    moving_time integer,
    elapsed_time integer,
    total_elevation_gain double precision,
    activity_type text NOT NULL,
    start_date timestamp without time zone,
    local_tz text,
    summary_track geography,
    start_latlng geography,
    end_latlng geography,
    elev_low real,
    elev_high real,
    external_id text
);
