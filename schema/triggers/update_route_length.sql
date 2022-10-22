CREATE FUNCTION update_route_length() RETURNS trigger AS $$
  BEGIN
    NEW.length := ST_Length(NEW.track);
    RETURN NEW;
  END
$$ LANGUAGE plpgsql;


CREATE TRIGGER
  update_route_length
BEFORE INSERT OR UPDATE ON
  routes
FOR EACH ROW EXECUTE PROCEDURE
  update_route_length();
