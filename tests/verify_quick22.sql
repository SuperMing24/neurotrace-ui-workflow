-- Synthetic tickets and sessions, rolled back at the end, on a disposable branch.
DO $qa$
DECLARE who text; uid uuid; r text; invite text:=repeat('a',64); wrong text:=repeat('f',64);
 good text:=repeat('b',64); dev text:=repeat('c',64); dproof text:=repeat('d',64);
 ses text:=repeat('1',64); ses2 text:=repeat('2',64);
BEGIN
 BEGIN
  FOREACH who IN ARRAY ARRAY['siqi','xiaowang'] LOOP
   SELECT id INTO STRICT uid FROM nt_identity.accounts WHERE handle=who AND role='developer_admin';
   INSERT INTO nt_identity.quick_credentials(token_hash,account_id,verifier,purpose,expires_at)
    VALUES(invite,uid,good,'invite',now()+interval '10 minutes');
   IF nt_identity.quick_login(who,wrong,good,true,dev,dproof,ses,NULL)<>'device_required' THEN RAISE EXCEPTION 'unpaired device'; END IF;
   IF nt_identity.quick_login(who,invite,wrong,true,dev,dproof,ses,NULL)<>'rejected' THEN RAISE EXCEPTION 'incorrect PIN'; END IF;
   r:=nt_identity.quick_login(who,invite,good,true,dev,dproof,ses,NULL);
   IF r IS DISTINCT FROM 'ok' OR NOT EXISTS(SELECT 1 FROM nt_identity.current_account(ses) WHERE id=uid) THEN RAISE EXCEPTION 'first login'; END IF;
   IF nt_identity.quick_login(who,invite,good,true,dev,dproof,ses,NULL)<>'device_required' THEN RAISE EXCEPTION 'invite replay'; END IF;
   IF nt_identity.quick_login(CASE who WHEN 'siqi' THEN 'xiaowang' ELSE 'siqi' END,dev,dproof,false,NULL,NULL,ses2,ses)<>'device_required' THEN RAISE EXCEPTION 'wrong account'; END IF;
   r:=nt_identity.quick_login(who,dev,dproof,false,NULL,NULL,ses2,ses);
   IF r IS DISTINCT FROM 'ok' OR EXISTS(SELECT 1 FROM nt_identity.current_account(ses)) THEN RAISE EXCEPTION 'resume and replace'; END IF;
   FOR i IN 1..5 LOOP r:=nt_identity.quick_login(who,dev,wrong,false,NULL,NULL,ses,NULL); END LOOP;
   IF r<>'throttled' OR nt_identity.quick_login(who,dev,dproof,false,NULL,NULL,ses,NULL)<>'throttled' THEN RAISE EXCEPTION 'rate limit'; END IF;
   DELETE FROM nt_identity.quick_credentials WHERE token_hash=dev;
   DELETE FROM nt_identity.sessions WHERE token_hash=ses2;
  END LOOP;
  IF has_table_privilege('neurotrace_web','nt_identity.quick_credentials','SELECT') OR has_table_privilege('neurotrace_web','nt_identity.quick_credentials','INSERT') THEN RAISE EXCEPTION 'role exposed'; END IF;
  RAISE EXCEPTION USING ERRCODE='Z9001',MESSAGE='roll back authentication fixtures';
 EXCEPTION WHEN SQLSTATE 'Z9001' THEN NULL;
 END;
END $qa$;
