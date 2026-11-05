-- Apply once after 003. Both actions take the same account row lock.
ALTER TABLE nt_identity.point_events ADD COLUMN chapter text CHECK (chapter IN ('dawn','tide','parallax')),
  ADD COLUMN item text, ADD COLUMN request_id uuid;
CREATE UNIQUE INDEX one_award_per_chapter ON nt_identity.point_events(account_id,chapter) WHERE chapter IS NOT NULL;
CREATE UNIQUE INDEX one_order_per_request ON nt_identity.point_events(account_id,request_id) WHERE request_id IS NOT NULL;

CREATE FUNCTION nt_identity.cleared(s text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
  SELECT COALESCE(jsonb_agg(e.chapter ORDER BY CASE e.chapter WHEN 'dawn' THEN 1 WHEN 'tide' THEN 2 ELSE 3 END),'[]'::jsonb)
  FROM point_events e JOIN current_account(s) c ON c.id=e.account_id WHERE e.chapter IS NOT NULL
$$;

CREATE FUNCTION nt_identity.grade(s text,ch text,edges jsonb) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE uid uuid; expected text[]; observed text[]; reward int; prior text;
BEGIN
  SELECT a.id INTO uid FROM accounts a JOIN current_account(s) c ON c.id=a.id FOR UPDATE OF a;
  IF uid IS NULL THEN RETURN -1; END IF;
  CASE ch
    WHEN 'dawn' THEN expected:=ARRAY['a:end|b:start'];reward:=60;
    WHEN 'tide' THEN expected:=ARRAY['a:end|b:start','e:end|f:start'];reward:=80;prior:='dawn';
    WHEN 'parallax' THEN expected:=ARRAY['a:end|b:start','c:end|d:start','e:end|f:start'];reward:=100;prior:='tide';
    ELSE RETURN -2;
  END CASE;
  IF prior IS NOT NULL AND NOT EXISTS(SELECT 1 FROM point_events WHERE account_id=uid AND chapter=prior) THEN RETURN -3; END IF;
  IF jsonb_typeof(edges) IS DISTINCT FROM 'array' OR jsonb_array_length(edges)<>cardinality(expected) THEN RETURN -2; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(edges) t(v) WHERE jsonb_typeof(v) IS DISTINCT FROM 'array') THEN RETURN -2; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(edges) t(v) WHERE jsonb_array_length(v)<>2 OR jsonb_typeof(v->0)<>'string' OR jsonb_typeof(v->1)<>'string' OR (v->>0) !~ '^[a-z]:(start|end)$' OR (v->>1) !~ '^[a-z]:(start|end)$') THEN RETURN -2; END IF;
  SELECT array_agg(pair ORDER BY pair COLLATE "C") INTO observed FROM
    (SELECT CASE WHEN (v->>0) COLLATE "C" < (v->>1) COLLATE "C" THEN (v->>0)||'|'||(v->>1) ELSE (v->>1)||'|'||(v->>0) END AS pair FROM jsonb_array_elements(edges) t(v)) pairs;
  IF observed IS DISTINCT FROM expected THEN RETURN -2; END IF;
  INSERT INTO point_events(event_id,account_id,chapter,delta) VALUES(uid||':chapter:'||ch,uid,ch,reward)
    ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN 0; END IF;
  RETURN reward;
END $$;

CREATE FUNCTION nt_identity.redeem(s text,product text,rid uuid) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE uid uuid; cost int; prev text; balance bigint;
BEGIN
  SELECT a.id INTO uid FROM accounts a JOIN current_account(s) c ON c.id=a.id FOR UPDATE OF a;
  IF uid IS NULL THEN RETURN -1; END IF;
  CASE product WHEN 'wasabi55' THEN cost:=60; WHEN 'snack-kit' THEN cost:=140;
    WHEN 'sampler' THEN cost:=220; WHEN 'backpack' THEN cost:=880; ELSE RETURN -2; END CASE;
  IF rid IS NULL THEN RETURN -2; END IF;
  SELECT item INTO prev FROM point_events WHERE account_id=uid AND request_id=rid;
  IF FOUND THEN IF prev=product THEN RETURN 0; ELSE RETURN -4; END IF; END IF;
  SELECT COALESCE(sum(delta),0) INTO balance FROM point_events WHERE account_id=uid AND occurred_at<=now();
  IF balance < cost THEN RETURN -3; END IF;
  INSERT INTO point_events(event_id,account_id,item,request_id,delta) VALUES(uid||':order:'||rid,uid,product,rid,-cost);
  RETURN cost;
END $$;

REVOKE ALL ON FUNCTION nt_identity.cleared(text),nt_identity.grade(text,text,jsonb),nt_identity.redeem(text,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION nt_identity.cleared(text),nt_identity.grade(text,text,jsonb),nt_identity.redeem(text,text,uuid) TO neurotrace_web;
