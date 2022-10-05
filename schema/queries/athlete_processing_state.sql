with
  processed as (
    select
      count(*),
      activities.athlete_id
    from processing
    join activities on activities.id = processing.activity_id
    where processed = true
    group by athlete_id
  ),
  unprocessed as (
    select
      count(*),
      activities.athlete_id
    from processing
    join activities on activities.id = processing.activity_id
    where processed = false
    group by athlete_id
  )
select
  processed.athlete_id,
  coalesce(processed.count, 0) as processed,
  coalesce(unprocessed.count, 0) as unprocessed,
  coalesce(processed.count, 0) + coalesce(unprocessed.count, 0) as total
from processed
full join unprocessed on processed.athlete_id = unprocessed.athlete_id;
