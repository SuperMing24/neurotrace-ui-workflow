-- Exercises the existing two accounts on the isolated preview branch and rolls every QA write back.
DO $qa$
DECLARE u uuid; token text; snap jsonb; order_id uuid;
BEGIN
 BEGIN
  FOR u IN SELECT id FROM nt_identity.accounts WHERE handle IN ('siqi','xiaowang') LOOP
   token:=encode(sha256(convert_to(gen_random_uuid()::text,'UTF8')),'hex');
   INSERT INTO nt_identity.sessions VALUES(token,u,now()+interval '5 minutes');
   DELETE FROM nt_identity.field_letters WHERE account_id=u;
   DELETE FROM nt_identity.field_reports WHERE account_id=u;
   DELETE FROM nt_identity.point_events WHERE account_id=u AND chapter IS NOT NULL;
   IF nt_identity.file_observation(token,'H-204','uncertain','[]') THEN RAISE EXCEPTION 'side unlocked early'; END IF;
   PERFORM nt_identity.grade(token,'dawn','[["a:end","b:start"]]');
   PERFORM nt_identity.grade(token,'tide','[["a:end","b:start"],["e:end","f:start"]]');
   IF jsonb_array_length(nt_identity.field_snapshot(token)->'letters')<>0 THEN RAISE EXCEPTION 'partial letter'; END IF;
   PERFORM nt_identity.grade(token,'parallax','[["a:end","b:start"],["c:end","d:start"],["e:end","f:start"]]');
   PERFORM nt_identity.grade(token,'parallax','[["a:end","b:start"],["c:end","d:start"],["e:end","f:start"]]');
   IF jsonb_array_length(nt_identity.field_snapshot(token)->'letters')<>1 THEN RAISE EXCEPTION 'chapter count'; END IF;
   PERFORM nt_identity.file_observation(token,'D-537','uncertain','[]');
   IF jsonb_array_length(nt_identity.field_snapshot(token)->'letters')<>1 THEN RAISE EXCEPTION 'single side letter'; END IF;
   PERFORM nt_identity.file_observation(token,'H-204','candidate','[["a:end","b:start"]]');
   PERFORM nt_identity.file_observation(token,'H-204','uncertain','[]');
   IF jsonb_array_length(nt_identity.field_snapshot(token)->'letters')<>2 THEN RAISE EXCEPTION 'pair count'; END IF;
   PERFORM nt_identity.read_field_letter(token,'exterior01');
   IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(nt_identity.field_snapshot(token)->'letters') x WHERE x->>'id'='exterior01' AND (x->>'read')::boolean) THEN RAISE EXCEPTION 'read receipts'; END IF;
   IF nt_identity.field_snapshot(repeat('0',64)) IS NOT NULL THEN RAISE EXCEPTION 'anonymous leakage'; END IF;
   IF (SELECT points-(CASE handle WHEN 'siqi' THEN 56328 ELSE 40584 END) FROM nt_identity.roster() WHERE id=u) <>2400 THEN RAISE EXCEPTION 'wallet deltas'; END IF;
   order_id:=gen_random_uuid();
   IF nt_identity.redeem(token,'wasabi55',order_id)<>600 OR nt_identity.redeem(token,'wasabi55',order_id)<>0 THEN RAISE EXCEPTION 'salmon price or replay'; END IF;
   IF (SELECT "weekPoints" FROM nt_identity.roster() WHERE id=u)<>1800 THEN RAISE EXCEPTION 'opening must not count as period earning'; END IF;
   IF (SELECT points FROM nt_identity.current_account(token))<>(SELECT points FROM nt_identity.roster() WHERE id=u) THEN RAISE EXCEPTION 'wallet and rank differ'; END IF;
  END LOOP;
  RAISE EXCEPTION USING ERRCODE='Z9001',MESSAGE='Rollback test state';
 EXCEPTION WHEN SQLSTATE 'Z9001' THEN NULL;
 END;
END $qa$;
