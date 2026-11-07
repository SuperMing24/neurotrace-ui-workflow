-- V2.1 per-player evidence from reference-keyed teaching samples. Wallet is separate.
CREATE TABLE nt_identity.practice_scores (
 account_id uuid NOT NULL REFERENCES nt_identity.accounts(id),
 sample text NOT NULL CHECK(sample IN ('C-101','V-426','T-315','R-608','M-712','J-834')),
 first_score smallint NOT NULL CHECK(first_score BETWEEN 0 AND 100),
 best_score smallint NOT NULL CHECK(best_score BETWEEN first_score AND 100),
 last_score smallint NOT NULL CHECK(last_score BETWEEN 0 AND best_score),
 hits smallint NOT NULL CHECK(hits >= 0), extra smallint NOT NULL CHECK(extra >= 0),
 missing smallint NOT NULL CHECK(missing >= 0),
 PRIMARY KEY (account_id,sample)
);
REVOKE ALL ON nt_identity.practice_scores FROM PUBLIC,neurotrace_web;

CREATE FUNCTION nt_identity.practice_snapshot(s text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
 SELECT jsonb_build_object('accountId',a.id,'scores',COALESCE((
  SELECT jsonb_object_agg(p.sample,jsonb_build_object(
   'first',p.first_score,'best',p.best_score,'last',p.last_score,
   'hits',p.hits,'extra',p.extra,'missing',p.missing))
  FROM practice_scores p WHERE p.account_id=a.id),'{}'::jsonb))
 FROM current_account(s) a
$$;

CREATE FUNCTION nt_identity.file_practice(s text,expected_user uuid,task text,h int,x int,m int)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE uid uuid; grade int;
BEGIN
 SELECT id INTO uid FROM current_account(s);
 IF uid IS NULL THEN RETURN jsonb_build_object('error','sign_in_required'); END IF;
 IF uid IS DISTINCT FROM expected_user THEN RETURN jsonb_build_object('error','account_changed'); END IF;
 IF (task='V-426' AND NOT EXISTS(SELECT 1 FROM point_events WHERE account_id=uid AND chapter='dawn'))
 OR (task='T-315' AND NOT EXISTS(SELECT 1 FROM point_events WHERE account_id=uid AND chapter='tide'))
 THEN RETURN jsonb_build_object('error','chapter_locked'); END IF;
 grade := round(200.0*h/(2*h+x+m));
 INSERT INTO practice_scores VALUES(uid,task,grade,grade,grade,h,x,m)
 ON CONFLICT (account_id,sample) DO UPDATE SET
 best_score=greatest(practice_scores.best_score,excluded.best_score),last_score=excluded.last_score,
 hits=excluded.hits,extra=excluded.extra,missing=excluded.missing;
 RETURN practice_snapshot(s);
END $$;

CREATE FUNCTION nt_identity.practice_staff(s text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
 SELECT CASE WHEN EXISTS(SELECT 1 FROM current_account(s) WHERE role='developer_admin') THEN
 jsonb_build_object('players',COALESCE((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.ready DESC,t.qualified DESC,t."firstMean" DESC,t.name)
 FROM (SELECT a.name, count(*)::int AS tested,round(avg(p.first_score))::int AS "firstMean",
 round(avg(p.best_score))::int AS "bestMean",count(*) FILTER(WHERE best_score>=85)::int AS qualified,
 (count(*) FILTER(WHERE best_score>=85)>=4 AND EXISTS(SELECT 1 FROM point_events WHERE account_id=a.id AND chapter='parallax')) AS ready,
 COALESCE((SELECT sum(delta) FROM point_events e WHERE e.account_id=a.id AND occurred_at<=now()),0) AS points
 FROM practice_scores p JOIN accounts a ON a.id=p.account_id GROUP BY a.id,a.name) t),'[]'::jsonb)) END
$$;
REVOKE ALL ON FUNCTION nt_identity.practice_snapshot(text), nt_identity.file_practice(text,uuid,text,int,int,int), nt_identity.practice_staff(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION nt_identity.practice_snapshot(text), nt_identity.file_practice(text,uuid,text,int,int,int), nt_identity.practice_staff(text) TO neurotrace_web;
