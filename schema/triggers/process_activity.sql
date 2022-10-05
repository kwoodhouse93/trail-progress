CREATE FUNCTION process_activity() RETURNS trigger AS $process_activity$
  BEGIN
    INSERT INTO processing (
      activity_id,
      route_id
    )
    SELECT
      new_table.id AS activity_id,
      routes.id AS route_id
    FROM new_table, routes;
    NOTIFY processing;
    RETURN NULL;
  END;
$process_activity$ LANGUAGE plpgsql;

CREATE TRIGGER process_activity
  AFTER INSERT ON activities
  REFERENCING NEW TABLE AS new_table
  FOR EACH STATEMENT EXECUTE FUNCTION process_activity();
