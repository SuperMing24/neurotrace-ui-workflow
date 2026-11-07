-- A one-use, privately issued invitation pairs one browser with one existing account.
-- Only digests and keyed verifiers are stored. Neither PINs nor raw tokens are persisted.
CREATE TABLE nt_identity.quick_credentials (
 token_hash text PRIMARY KEY CHECK(token_hash ~ '^[0-9a-f]{64}$'),
 account_id uuid NOT NULL REFERENCES nt_identity.accounts(id),
 verifier text NOT NULL CHECK(verifier ~ '^[0-9a-f]{64}$'),
 purpose text NOT NULL CHECK(purpose IN ('invite','device')),
 expires_at timestamptz NOT NULL,
 failures int NOT NULL DEFAULT 0,
 locked_until timestamptz
);
REVOKE ALL ON nt_identity.quick_credentials FROM PUBLIC,neurotrace_web;

CREATE FUNCTION nt_identity.quick_login(who text,proof_hash text,attempt text,enrolling boolean,
 new_device text,new_verifier text,new_session text,prior_session text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE ticket quick_credentials%ROWTYPE;
BEGIN
 IF who NOT IN ('siqi','xiaowang') OR new_session IS NULL OR new_session !~ '^[0-9a-f]{64}$' THEN RETURN 'rejected'; END IF;
 SELECT q.* INTO ticket FROM quick_credentials q JOIN accounts a ON a.id=q.account_id
 WHERE a.handle=who AND q.token_hash=proof_hash AND q.purpose=CASE WHEN enrolling THEN 'invite' ELSE 'device' END
 AND q.expires_at>now() FOR UPDATE OF q;
 IF NOT FOUND THEN RETURN 'device_required'; END IF;
 IF ticket.locked_until>now() THEN RETURN 'throttled'; END IF;
 IF attempt IS DISTINCT FROM ticket.verifier THEN
  UPDATE quick_credentials SET failures=CASE WHEN failures>=4 THEN 0 ELSE failures+1 END,
   locked_until=CASE WHEN failures>=4 THEN now()+interval '15 minutes' ELSE NULL END WHERE token_hash=proof_hash;
  RETURN CASE WHEN ticket.failures>=4 THEN 'throttled' ELSE 'rejected' END;
 END IF;
 IF enrolling THEN
  DELETE FROM quick_credentials WHERE token_hash=proof_hash;
  INSERT INTO quick_credentials(token_hash,account_id,verifier,purpose,expires_at)
   VALUES(new_device,ticket.account_id,new_verifier,'device',now()+interval '180 days');
 ELSE
  UPDATE quick_credentials SET failures=0,locked_until=NULL WHERE token_hash=proof_hash;
 END IF;
 DELETE FROM sessions WHERE token_hash=prior_session OR expires_at<=now();
 INSERT INTO sessions(token_hash,account_id,expires_at) VALUES(new_session,ticket.account_id,now()+interval '4 hours');
 RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION nt_identity.quick_login(text,text,text,boolean,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION nt_identity.quick_login(text,text,text,boolean,text,text,text,text) TO neurotrace_web;
