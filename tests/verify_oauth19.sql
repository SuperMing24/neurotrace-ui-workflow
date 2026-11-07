-- Execute on a disposable branch after migration 005. No test identity survives ROLLBACK.
BEGIN;
SET LOCAL ROLE neurotrace_web;
DO $$
DECLARE
  n text:=encode(sha256(convert_to(gen_random_uuid()::text,'UTF8')),'hex');
  q text:=encode(sha256(convert_to('qq'||n,'UTF8')),'hex');
  w text:=encode(sha256(convert_to('wx'||n,'UTF8')),'hex');
  s1 text:=encode(sha256(convert_to('s1'||n,'UTF8')),'hex');
  s2 text:=encode(sha256(convert_to('s2'||n,'UTF8')),'hex');
  other_s text:=encode(sha256(convert_to('s3'||n,'UTF8')),'hex');
  uid uuid;
BEGIN
  IF NOT nt_identity.start_oauth(n,'qq',null) THEN RAISE EXCEPTION 'start sign-in'; END IF;
  IF nt_identity.finish_oauth(n,'qq',q,s1)<>'signed_in' THEN RAISE EXCEPTION 'first sign-in failed'; END IF;
  SELECT id INTO STRICT uid FROM nt_identity.current_account(s1) WHERE role='player' AND points=0;
  IF nt_identity.finish_oauth(n,'qq',q,s2)<>'expired' THEN RAISE EXCEPTION 'replay accepted'; END IF;
  IF NOT nt_identity.start_oauth(n,'wechat',s1) THEN RAISE EXCEPTION 'start bind'; END IF;
  IF nt_identity.finish_oauth(n,'wechat',w,s2)<>'linked' THEN RAISE EXCEPTION 'bind failed'; END IF;
  IF NOT EXISTS(SELECT 1 FROM nt_identity.linked_channels(s1) ch WHERE ch='wechat') THEN RAISE EXCEPTION 'missing channel'; END IF;
  IF NOT nt_identity.start_oauth(n,'wechat',null) THEN RAISE EXCEPTION 'start second sign-in'; END IF;
  IF nt_identity.finish_oauth(n,'wechat',w,s2)<>'signed_in' THEN RAISE EXCEPTION 'login failed'; END IF;
  IF (SELECT id FROM nt_identity.current_account(s2)) IS DISTINCT FROM uid THEN RAISE EXCEPTION 'binding changed account'; END IF;
  IF NOT nt_identity.start_oauth(n,'qq',null) THEN RAISE EXCEPTION 'start new player'; END IF;
  IF nt_identity.finish_oauth(n,'qq',w,other_s)<>'signed_in' THEN RAISE EXCEPTION 'other player setup'; END IF;
  IF NOT nt_identity.start_oauth(n,'wechat',other_s) THEN RAISE EXCEPTION 'start conflict case'; END IF;
  IF nt_identity.finish_oauth(n,'wechat',w,s2)<>'conflict' THEN RAISE EXCEPTION 'subject stolen'; END IF;
  IF NOT nt_identity.start_oauth(n,'wechat',s1) THEN RAISE EXCEPTION 'start'; END IF;
  PERFORM nt_identity.signout(s1);
  IF nt_identity.finish_oauth(n,'wechat',q,s2)<>'expired' THEN RAISE EXCEPTION 'revoked session allowed binding'; END IF;
END $$;
ROLLBACK;
