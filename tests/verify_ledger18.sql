-- Run on the isolated preview branch as the database owner after migration 006.
-- A subtransaction rolls back every test credential, session and balance change.
DO $qa$
DECLARE a text; k text:=repeat('a',64); s text:=repeat('b',64); expected jsonb:='[["b:start","a:end"]]'; r uuid:=gen_random_uuid(); who text:='qa-'||gen_random_uuid();
BEGIN
  BEGIN
    INSERT INTO nt_identity.accounts(id,handle,name,role) VALUES(gen_random_uuid(),who,'QA','player');
    a:=nt_identity.issue_activation(who);
    IF NOT nt_identity.signin(k,s,encode(sha256(convert_to(a,'UTF8')),'hex')) THEN RAISE EXCEPTION 'activation'; END IF;
    IF nt_identity.grade(s,'tide',expected) <> -3 OR nt_identity.grade(s,'dawn','[]') <> -2 THEN RAISE EXCEPTION 'locked or missed'; END IF;
    IF nt_identity.grade(s,'dawn','[["a:end","b:start"],["a:end","b:start"]]') <> -2 THEN RAISE EXCEPTION 'duplicates'; END IF;
    IF nt_identity.grade(s,'dawn',expected)<>600 OR nt_identity.grade(s,'dawn',expected)<>0 THEN RAISE EXCEPTION 'award'; END IF;
    IF (SELECT "weekPoints" <>600 OR "monthPoints"<>600 OR points<>600 FROM nt_identity.roster() WHERE handle=who) THEN RAISE EXCEPTION 'period mismatch'; END IF;
    IF nt_identity.redeem(s,'backpack',r) <> -3 THEN RAISE EXCEPTION 'overspend'; END IF;
    IF nt_identity.redeem(s,'wasabi55',r) <>600 OR nt_identity.redeem(s,'wasabi55',r)<>0 OR nt_identity.redeem(s,'snack-kit',r)<>-4 THEN RAISE EXCEPTION 'redemption or replay'; END IF;
    IF nt_identity.grade(s,'tide','[["f:start","e:end"],["a:end","b:start"]]')<>800 THEN RAISE EXCEPTION 'tide'; END IF;
    IF nt_identity.grade(s,'parallax','[["f:start","e:end"],["a:end","b:start"],["d:start","c:end"]]')<>1000 THEN RAISE EXCEPTION 'parallax'; END IF;
    IF nt_identity.cleared(s)<>'["dawn","tide","parallax"]'::jsonb THEN RAISE EXCEPTION 'restore progress'; END IF;
    IF (SELECT "weekPoints"<>1800 OR "monthPoints"<>1800 OR points<>1800 FROM nt_identity.roster() WHERE handle=who) THEN RAISE EXCEPTION 'wallet ranks mismatch'; END IF;
    IF (SELECT points FROM nt_identity.current_account(s))<>1800 THEN RAISE EXCEPTION 'wallet mismatch'; END IF;
    IF nt_identity.grade(repeat('e',64),'dawn',expected)<>-1 THEN RAISE EXCEPTION 'anonymous award'; END IF;
    RAISE EXCEPTION USING ERRCODE='Z9001',MESSAGE='Rollback test state';
  EXCEPTION WHEN SQLSTATE 'Z9001' THEN NULL;
  END;
END $qa$;
