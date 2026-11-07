-- Existing best scores have no submission dates. Start both Shanghai calendar boards
-- at installation; keep the existing per-specimen records for the all-time board.
CREATE TABLE nt_identity.practice_period_bests (
 period text NOT NULL CHECK (period IN ('week','month')),
 starts_on date NOT NULL,
 account_id uuid NOT NULL,
 sample text NOT NULL,
 best_score smallint NOT NULL CHECK (best_score BETWEEN 0 AND 100),
 PRIMARY KEY(period,starts_on,account_id,sample),
 FOREIGN KEY(account_id,sample) REFERENCES nt_identity.practice_scores(account_id,sample) ON DELETE CASCADE
);
REVOKE ALL ON nt_identity.practice_period_bests FROM PUBLIC,neurotrace_web;

CREATE FUNCTION nt_identity.track_period_practice() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE local_time timestamp := statement_timestamp() AT TIME ZONE 'Asia/Shanghai';
BEGIN
 INSERT INTO practice_period_bests(period,starts_on,account_id,sample,best_score) VALUES
 ('week',date_trunc('week',local_time)::date,NEW.account_id,NEW.sample,NEW.last_score),
 ('month',date_trunc('month',local_time)::date,NEW.account_id,NEW.sample,NEW.last_score)
 ON CONFLICT(period,starts_on,account_id,sample) DO UPDATE SET
 best_score=greatest(practice_period_bests.best_score,EXCLUDED.best_score);
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION nt_identity.track_period_practice() FROM PUBLIC;
CREATE TRIGGER record_rank_period AFTER INSERT OR UPDATE OF last_score ON nt_identity.practice_scores
 FOR EACH ROW EXECUTE FUNCTION nt_identity.track_period_practice();

CREATE FUNCTION nt_identity.performance_rank(selected_period text)
RETURNS TABLE(id uuid,name text,score integer,completed integer,samples integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
 WITH specimen_bests AS (
  SELECT p.account_id,p.best_score FROM practice_scores p WHERE selected_period='all'
  UNION ALL
  SELECT p.account_id,p.best_score FROM practice_period_bests p
  WHERE p.period=selected_period AND p.starts_on=
   CASE selected_period
    WHEN 'week' THEN date_trunc('week',now() AT TIME ZONE 'Asia/Shanghai')::date
    WHEN 'month' THEN date_trunc('month',now() AT TIME ZONE 'Asia/Shanghai')::date
   END
 )
 SELECT a.id,a.name,round(avg(p.best_score))::int AS score,
  (count(*) FILTER(WHERE p.best_score=100))::int AS completed,count(*)::int AS samples
 FROM specimen_bests p JOIN accounts a ON a.id=p.account_id GROUP BY a.id,a.name
 ORDER BY score DESC,completed DESC,samples DESC,a.name,a.id
$$;
REVOKE ALL ON FUNCTION nt_identity.performance_rank(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION nt_identity.performance_rank(text) TO neurotrace_web;
