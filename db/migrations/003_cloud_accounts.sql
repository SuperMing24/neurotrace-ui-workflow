-- Apply as the database owner after creating the restricted login role neurotrace_web.
CREATE SCHEMA nt_identity;
REVOKE ALL ON SCHEMA nt_identity FROM PUBLIC;
CREATE TABLE nt_identity.accounts (
  id uuid PRIMARY KEY,
  handle text NOT NULL UNIQUE,
  name text NOT NULL,
  title text NOT NULL DEFAULT '',
  role text NOT NULL CHECK (role IN ('player','reviewer','developer_admin')),
  activation_hash text UNIQUE,
  activation_expiry timestamptz,
  login_hash text UNIQUE,
  CHECK ((activation_hash IS NULL) = (activation_expiry IS NULL))
);
CREATE TABLE nt_identity.point_events (
  event_id text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES nt_identity.accounts(id),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  delta integer NOT NULL
);
CREATE INDEX points_account_time ON nt_identity.point_events(account_id, occurred_at);
CREATE TABLE nt_identity.sessions (
  token_hash text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES nt_identity.accounts(id),
  expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_account ON nt_identity.sessions(account_id);
CREATE TABLE nt_identity.admin_events (
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor uuid NOT NULL REFERENCES nt_identity.accounts(id),
  target uuid NOT NULL REFERENCES nt_identity.accounts(id),
  event text NOT NULL
);
INSERT INTO nt_identity.accounts(id,handle,name,title,role) VALUES
 ('975dc343-4c9b-48d9-9224-69231d4ac047','siqi','四七','破壁人','developer_admin'),
 ('bf5d8f84-2d8b-418b-9d47-2f1ecb64d249','xiaowang','小王','面壁者','developer_admin');

-- Owned by the project operator. No EXECUTE grant to the web runtime.
CREATE FUNCTION nt_identity.issue_activation(who text) RETURNS text
LANGUAGE plpgsql SET search_path = pg_catalog, nt_identity, pg_temp AS $$
DECLARE secret text := replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
BEGIN
  UPDATE accounts SET activation_hash = encode(sha256(convert_to(secret,'UTF8')),'hex'),
    activation_expiry = now()+interval '30 minutes' WHERE handle=who;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown account'; END IF;
  RETURN secret;
END $$;

CREATE FUNCTION nt_identity.roster() RETURNS TABLE
(id uuid,handle text,name text,title text,role text,points bigint,"weekPoints" bigint,"monthPoints" bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
  SELECT a.id,a.handle,a.name,a.title,a.role,COALESCE(sum(p.delta),0),
    COALESCE(sum(p.delta) FILTER (WHERE p.occurred_at >= date_trunc('week', now() AT TIME ZONE 'Asia/Shanghai') AT TIME ZONE 'Asia/Shanghai'),0),
    COALESCE(sum(p.delta) FILTER (WHERE p.occurred_at >= date_trunc('month', now() AT TIME ZONE 'Asia/Shanghai') AT TIME ZONE 'Asia/Shanghai'),0)
  FROM accounts a LEFT JOIN point_events p ON p.account_id=a.id AND p.occurred_at <= now()
  GROUP BY a.id ORDER BY COALESCE(sum(p.delta),0) DESC,a.handle LIMIT 100
$$;

CREATE FUNCTION nt_identity.current_account(s text) RETURNS TABLE
(id uuid,handle text,name text,title text,role text,points bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
  SELECT a.id,a.handle,a.name,a.title,a.role,(SELECT COALESCE(sum(p.delta),0) FROM point_events p WHERE p.account_id=a.id AND p.occurred_at<=now()) FROM sessions t
  JOIN accounts a ON a.id=t.account_id WHERE t.token_hash=s AND t.expires_at>now()
$$;

CREATE FUNCTION nt_identity.signin(k text,s text,activation text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE account uuid;
BEGIN
  IF k !~ '^[0-9a-f]{64}$' OR s !~ '^[0-9a-f]{64}$' OR k IS NULL OR s IS NULL THEN RETURN false; END IF;
  IF activation IS NOT NULL THEN
    UPDATE accounts SET activation_hash=NULL,activation_expiry=NULL,login_hash=k
      WHERE activation_hash=activation AND activation_expiry>now() RETURNING id INTO account;
    IF account IS NOT NULL THEN
      DELETE FROM sessions WHERE account_id=account;
      INSERT INTO admin_events(actor,target,event) VALUES(account,account,'activated');
    END IF;
  ELSE
    SELECT id INTO account FROM accounts WHERE login_hash=k FOR UPDATE;
  END IF;
  IF account IS NULL THEN RETURN false; END IF;
  DELETE FROM sessions WHERE expires_at <= now();
  INSERT INTO sessions(token_hash,account_id,expires_at) VALUES(s,account,now()+interval '4 hours');
  RETURN true;
END $$;

CREATE FUNCTION nt_identity.signout(s text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
  DELETE FROM sessions WHERE token_hash=s
$$;

CREATE FUNCTION nt_identity.staff_directory(s text) RETURNS TABLE
(id uuid,name text,role text,activated boolean,active_sessions bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
  SELECT a.id,a.name,a.role,a.login_hash IS NOT NULL,
    (SELECT count(*) FROM sessions t WHERE t.account_id=a.id AND t.expires_at>now())
  FROM accounts a WHERE EXISTS(SELECT 1 FROM current_account(s) c WHERE c.role='developer_admin')
  ORDER BY a.handle
$$;

CREATE FUNCTION nt_identity.revoke_sessions(s text,who uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM current_account(s) WHERE role='developer_admin';
  IF admin_id IS NULL OR NOT EXISTS(SELECT 1 FROM accounts WHERE id=who) THEN RETURN false; END IF;
  DELETE FROM sessions WHERE account_id=who;
  INSERT INTO admin_events(actor,target,event) VALUES(admin_id,who,'sessions_revoked');
  RETURN true;
END $$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA nt_identity FROM PUBLIC;
GRANT USAGE ON SCHEMA nt_identity TO neurotrace_web;
GRANT EXECUTE ON FUNCTION nt_identity.roster(),nt_identity.current_account(text),nt_identity.signin(text,text,text),nt_identity.signout(text),nt_identity.staff_directory(text),nt_identity.revoke_sessions(text,uuid) TO neurotrace_web;
