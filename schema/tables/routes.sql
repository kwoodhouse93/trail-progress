CREATE TABLE routes (
    id text primary key DEFAULT uuid_generate_v4(),
    created_at timestamp without time zone DEFAULT now(),
    track geography(LineString) NOT NULL,
    length float NOT NULL,
    description text,
    display_name text NOT NULL,
    thumbnail bytea NOT NULL
);
