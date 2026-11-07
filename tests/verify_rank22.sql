-- Run on an isolated QA branch. Fixtures roll back before this block returns.
DO $qa$
DECLARE uid uuid:=gen_random_uuid(); row_data record; span text;
BEGIN
 BEGIN
  INSERT INTO nt_identity.accounts(id,handle,name,role) VALUES(uid,'qa-rank-'||uid,'Rank QA','player');
  INSERT INTO nt_identity.practice_scores VALUES(uid,'C-101',100,100,100,1,0,0);
  -- Emulate a migrated V2.1 score. No period attribution exists until the next submission.
  DELETE FROM nt_identity.practice_period_bests WHERE account_id=uid;
  IF EXISTS(SELECT 1 FROM nt_identity.performance_rank('week') WHERE id=uid) OR
     EXISTS(SELECT 1 FROM nt_identity.performance_rank('month') WHERE id=uid) THEN RAISE EXCEPTION 'legacy score leaked into a period'; END IF;
  SELECT * INTO STRICT row_data FROM nt_identity.performance_rank('all') WHERE id=uid;
  IF row_data.score<>100 OR row_data.completed<>1 OR row_data.samples<>1 THEN RAISE EXCEPTION 'all-time lost legacy record'; END IF;
  UPDATE nt_identity.practice_scores SET last_score=40 WHERE account_id=uid AND sample='C-101';
  UPDATE nt_identity.practice_scores SET last_score=60 WHERE account_id=uid AND sample='C-101';
  UPDATE nt_identity.practice_scores SET last_score=30 WHERE account_id=uid AND sample='C-101';
  INSERT INTO nt_identity.practice_scores VALUES(uid,'R-608',100,100,100,2,0,0);
  INSERT INTO nt_identity.practice_period_bests VALUES('week','2000-01-03',uid,'C-101',99),('month','2000-01-01',uid,'C-101',99);
  FOREACH span IN ARRAY ARRAY['week','month'] LOOP
   SELECT * INTO STRICT row_data FROM nt_identity.performance_rank(span) WHERE id=uid;
   IF row_data.score<>80 OR row_data.completed<>1 OR row_data.samples<>2 THEN RAISE EXCEPTION 'period scope/best/count incorrect for %',span; END IF;
  END LOOP;
  SELECT * INTO STRICT row_data FROM nt_identity.performance_rank('all') WHERE id=uid;
  IF row_data.score<>100 OR row_data.completed<>2 OR row_data.samples<>2 THEN RAISE EXCEPTION 'lifetime best overwritten'; END IF;
  IF (SELECT count(*) FROM nt_identity.practice_period_bests WHERE account_id=uid)<>6 THEN RAISE EXCEPTION 'repeat created duplicate period entries'; END IF;
  IF has_table_privilege('neurotrace_web','nt_identity.practice_period_bests','SELECT') THEN RAISE EXCEPTION 'raw history exposed'; END IF;
  RAISE EXCEPTION USING ERRCODE='Z9001',MESSAGE='rollback practice periods';
 EXCEPTION WHEN SQLSTATE 'Z9001' THEN NULL;
 END;
END $qa$;
