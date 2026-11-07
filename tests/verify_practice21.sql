-- On the isolated QA branch. Synthetic identities and scores roll back together.
DO $qa$
DECLARE a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); tok text:=md5(random()::text);
 admin_token text:=md5(random()::text); s jsonb; other_id uuid;
BEGIN
 BEGIN
  INSERT INTO nt_identity.accounts(id,handle,name,role) VALUES(a,'qa21-'||a,'QA player','player'),(b,'qa21-'||b,'QA admin','developer_admin');
  INSERT INTO nt_identity.sessions VALUES(tok,a,now()+interval '1 minute'),(admin_token,b,now()+interval '1 minute');
  IF nt_identity.practice_staff(tok) IS NOT NULL OR nt_identity.practice_snapshot('bad') IS NOT NULL THEN RAISE EXCEPTION 'privacy'; END IF;
  IF nt_identity.file_practice(tok,b,'C-101',1,0,0)->>'error'<>'account_changed' THEN RAISE EXCEPTION 'wrong account'; END IF;
  IF nt_identity.file_practice(tok,a,'T-315',1,0,2)->>'error'<>'chapter_locked' THEN RAISE EXCEPTION 'unearned access'; END IF;
  s:=nt_identity.file_practice(tok,a,'R-608',1,1,1);
  IF (s#>>'{scores,R-608,first}')::int IS DISTINCT FROM 50 THEN RAISE EXCEPTION 'first'; END IF;
  s:=nt_identity.file_practice(tok,a,'R-608',2,0,0);
  s:=nt_identity.file_practice(tok,a,'R-608',0,0,2);
  IF (s#>>'{scores,R-608,first}')::int IS DISTINCT FROM 50 OR (s#>>'{scores,R-608,best}')::int IS DISTINCT FROM 100 OR (s#>>'{scores,R-608,last}')::int IS DISTINCT FROM 0 THEN RAISE EXCEPTION 'first/best/latest'; END IF;
  IF nt_identity.practice_snapshot(admin_token)->'scores' IS DISTINCT FROM '{}'::jsonb THEN RAISE EXCEPTION 'account isolation'; END IF;
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(nt_identity.practice_staff(admin_token)->'players') p WHERE p->>'name'='QA player' AND (p->>'qualified')::int=1 AND NOT (p->>'ready')::boolean) THEN RAISE EXCEPTION 'staff filter'; END IF;
  IF EXISTS(SELECT 1 FROM nt_identity.point_events WHERE account_id=a) THEN RAISE EXCEPTION 'assessment minted points'; END IF;
  IF has_table_privilege('neurotrace_web','nt_identity.practice_scores','SELECT') OR has_table_privilege('neurotrace_web','nt_identity.practice_scores','INSERT') THEN RAISE EXCEPTION 'role has raw access'; END IF;
  RAISE EXCEPTION USING ERRCODE='Z9001',MESSAGE='rollback branch checks';
 EXCEPTION WHEN SQLSTATE 'Z9001' THEN NULL;
 END;
END $qa$;
