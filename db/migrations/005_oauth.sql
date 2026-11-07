-- Run as the schema owner. OAuth identities are scoped to a provider and application.
CREATE TABLE nt_identity.external_ids (
  provider text NOT NULL CHECK (provider IN ('wechat','qq')),
  subject_hash text NOT NULL CHECK (subject_hash ~ '^[0-9a-f]{64}$'),
  account_id uuid NOT NULL REFERENCES nt_identity.accounts(id),
  PRIMARY KEY(provider,subject_hash), UNIQUE(account_id,provider)
);
CREATE TABLE nt_identity.oauth_requests (
  state_hash text PRIMARY KEY CHECK (state_hash ~ '^[0-9a-f]{64}$'),
  provider text NOT NULL CHECK (provider IN ('wechat','qq')),
  bind_session text,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '8 minutes'
);
CREATE INDEX oauth_expiry ON nt_identity.oauth_requests(expires_at);

CREATE FUNCTION nt_identity.linked_channels(s text) RETURNS SETOF text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
  SELECT e.provider FROM external_ids e JOIN current_account(s) c ON c.id=e.account_id
$$;
CREATE FUNCTION nt_identity.start_oauth(nonce text,channel text,bind_to text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
BEGIN
  IF bind_to IS NOT NULL AND NOT EXISTS (SELECT 1 FROM current_account(bind_to)) THEN RETURN false; END IF;
  DELETE FROM oauth_requests WHERE expires_at<=now();
  INSERT INTO oauth_requests(state_hash,provider,bind_session) VALUES(nonce,channel,bind_to);
  RETURN true;
END $$;
CREATE FUNCTION nt_identity.finish_oauth(nonce text,channel text,subject text,new_session text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE request oauth_requests%ROWTYPE; owner_id uuid; actor_id uuid;
BEGIN
  DELETE FROM oauth_requests WHERE state_hash=nonce AND provider=channel AND expires_at>now() RETURNING * INTO request;
  IF NOT FOUND OR subject IS NULL OR subject !~ '^[0-9a-f]{64}$' OR new_session IS NULL OR new_session !~ '^[0-9a-f]{64}$' THEN RETURN 'expired'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(channel||subject,0));
  SELECT account_id INTO owner_id FROM external_ids WHERE provider=channel AND subject_hash=subject;
  IF request.bind_session IS NOT NULL THEN
    SELECT a.id INTO actor_id FROM sessions s JOIN accounts a ON a.id=s.account_id
      WHERE s.token_hash=request.bind_session AND s.expires_at>now() FOR UPDATE OF s,a;
    IF actor_id IS NULL THEN RETURN 'expired'; END IF;
    IF owner_id IS NOT NULL AND owner_id<>actor_id THEN RETURN 'conflict'; END IF;
    IF EXISTS (SELECT 1 FROM external_ids WHERE account_id=actor_id AND provider=channel AND subject_hash<>subject) THEN RETURN 'conflict'; END IF;
    IF owner_id IS NULL THEN INSERT INTO external_ids VALUES(channel,subject,actor_id); END IF;
    RETURN 'linked';
  END IF;
  IF owner_id IS NULL THEN
    owner_id:=gen_random_uuid();
    INSERT INTO accounts(id,handle,name,title,role) VALUES(owner_id,'user-'||owner_id,'观测员·'||left(owner_id::text,6),'星图观测员','player');
    INSERT INTO external_ids VALUES(channel,subject,owner_id);
  END IF;
  DELETE FROM sessions WHERE expires_at<=now();
  INSERT INTO sessions VALUES(new_session,owner_id,now()+interval '4 hours');
  RETURN 'signed_in';
END $$;
REVOKE ALL ON FUNCTION nt_identity.linked_channels(text),nt_identity.start_oauth(text,text,text),nt_identity.finish_oauth(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION nt_identity.linked_channels(text),nt_identity.start_oauth(text,text,text),nt_identity.finish_oauth(text,text,text,text) TO neurotrace_web;
