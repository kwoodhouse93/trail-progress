CREATE FUNCTION process_route() RETURNS trigger AS $process_route$
  BEGIN
    INSERT INTO processing (
      route_id,
      activity_id
    )
    SELECT
      new_table.id AS route_id,
      activities.id AS activity_id
    FROM new_table, activities;
    NOTIFY processing;
    RETURN NULL;
  END;
$process_route$ LANGUAGE plpgsql;

CREATE TRIGGER process_route
  AFTER INSERT ON routes
  REFERENCING NEW TABLE AS new_table
  FOR EACH STATEMENT EXECUTE FUNCTION process_route();
