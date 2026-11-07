-- Set the two reserved starting balances in the current shop units.
-- Opening entries belong to the total wallet, never to the weekly/monthly training totals.
INSERT INTO nt_identity.point_events(event_id,account_id,delta)
SELECT 'opening:v19:'||a.handle, a.id, v.balance
FROM (VALUES ('siqi',56328),('xiaowang',40584)) v(handle,balance)
JOIN nt_identity.accounts a USING(handle) ON CONFLICT(event_id) DO UPDATE SET delta=EXCLUDED.delta
WHERE nt_identity.point_events.account_id=EXCLUDED.account_id AND
 ((EXCLUDED.event_id='opening:v19:siqi' AND nt_identity.point_events.delta=5632803)
 OR (EXCLUDED.event_id='opening:v19:xiaowang' AND nt_identity.point_events.delta=4058362));

CREATE OR REPLACE FUNCTION nt_identity.roster() RETURNS TABLE
(id uuid,handle text,name text,title text,role text,points bigint,"weekPoints" bigint,"monthPoints" bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
  SELECT a.id,a.handle,a.name,a.title,a.role,COALESCE(sum(p.delta),0),
    COALESCE(sum(p.delta) FILTER(WHERE p.event_id NOT LIKE 'opening:v19:%' AND p.occurred_at >= date_trunc('week',now() AT TIME ZONE 'Asia/Shanghai') AT TIME ZONE 'Asia/Shanghai'),0),
    COALESCE(sum(p.delta) FILTER(WHERE p.event_id NOT LIKE 'opening:v19:%' AND p.occurred_at >= date_trunc('month',now() AT TIME ZONE 'Asia/Shanghai') AT TIME ZONE 'Asia/Shanghai'),0)
  FROM accounts a LEFT JOIN point_events p ON p.account_id=a.id AND p.occurred_at<=now()
  GROUP BY a.id ORDER BY COALESCE(sum(p.delta),0) DESC,a.handle
$$;

CREATE TABLE IF NOT EXISTS nt_identity.field_reports (
 account_id uuid NOT NULL REFERENCES nt_identity.accounts(id), sample text NOT NULL CHECK(sample IN ('H-204','D-537')),
 kind text NOT NULL CHECK(kind IN ('candidate','uncertain')), edges jsonb NOT NULL,
 filed_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(account_id,sample)
);
CREATE TABLE IF NOT EXISTS nt_identity.field_letters (
 account_id uuid NOT NULL REFERENCES nt_identity.accounts(id), milestone text NOT NULL CHECK(milestone IN ('exterior01','fieldpair')),
 sent_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz, PRIMARY KEY(account_id,milestone)
);
CREATE OR REPLACE FUNCTION nt_identity.on_field_milestone() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE milestone_id text;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM accounts WHERE id=NEW.account_id AND handle IN ('siqi','xiaowang')) THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='point_events' THEN
  IF NEW.chapter IS DISTINCT FROM 'parallax' THEN RETURN NEW; END IF;
  milestone_id:='exterior01';
 ELSE
  IF (SELECT count(*) FROM field_reports WHERE account_id=NEW.account_id)<2 THEN RETURN NEW; END IF;
  milestone_id:='fieldpair';
 END IF;
 INSERT INTO field_letters(account_id,milestone) VALUES(NEW.account_id,milestone_id) ON CONFLICT DO NOTHING;
 RETURN NEW;
END $$;
CREATE OR REPLACE TRIGGER nt_chapter_post AFTER INSERT ON nt_identity.point_events FOR EACH ROW EXECUTE FUNCTION nt_identity.on_field_milestone();
CREATE OR REPLACE TRIGGER nt_field_post AFTER INSERT ON nt_identity.field_reports FOR EACH ROW EXECUTE FUNCTION nt_identity.on_field_milestone();
-- Older completions retain their original completion date.
INSERT INTO nt_identity.field_letters(account_id,milestone,sent_at)
 SELECT e.account_id,'exterior01',e.occurred_at FROM nt_identity.point_events e JOIN nt_identity.accounts a ON a.id=e.account_id
 WHERE e.chapter='parallax' AND a.handle IN ('siqi','xiaowang') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION nt_identity.field_snapshot(s text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
 SELECT jsonb_build_object('accountId',a.id,'reports',COALESCE((SELECT jsonb_object_agg(sample,jsonb_build_object('kind',kind,'time',updated_at,'edges',edges)) FROM field_reports WHERE account_id=a.id),'{}'),
  'letters',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',milestone,'time',sent_at,'read',read_at IS NOT NULL) ORDER BY sent_at) FROM field_letters WHERE account_id=a.id),'[]'))
 FROM current_account(s) a
$$;
CREATE OR REPLACE FUNCTION nt_identity.file_observation(s text,t text,k text,ed jsonb) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE uid uuid;
BEGIN
 SELECT a.id INTO uid FROM accounts a JOIN current_account(s) c ON a.id=c.id FOR UPDATE OF a;
 IF uid IS NULL OR t NOT IN ('H-204','D-537') OR k NOT IN ('candidate','uncertain') OR jsonb_typeof(ed) IS DISTINCT FROM 'array' THEN RETURN false; END IF;
 IF NOT EXISTS(SELECT 1 FROM point_events WHERE account_id=uid AND chapter='parallax') OR jsonb_array_length(ed)>120 OR (k='candidate' AND jsonb_array_length(ed)=0) THEN RETURN false; END IF;
 INSERT INTO field_reports(account_id,sample,kind,edges) VALUES(uid,t,k,ed)
 ON CONFLICT(account_id,sample) DO UPDATE SET kind=EXCLUDED.kind,edges=EXCLUDED.edges,updated_at=now();
 RETURN true;
END $$;
CREATE OR REPLACE FUNCTION nt_identity.read_field_letter(s text,m text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
 UPDATE field_letters SET read_at=COALESCE(read_at,now()) WHERE account_id=(SELECT id FROM current_account(s)) AND milestone=m
$$;
REVOKE ALL ON FUNCTION nt_identity.on_field_milestone(),nt_identity.field_snapshot(text),nt_identity.file_observation(text,text,text,jsonb),nt_identity.read_field_letter(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION nt_identity.field_snapshot(text),nt_identity.file_observation(text,text,text,jsonb),nt_identity.read_field_letter(text,text) TO neurotrace_web;

-- Preserve the existing server validations and grants while re-pricing training and supplies.
CREATE OR REPLACE FUNCTION nt_identity.grade(s text,ch text,edges jsonb) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE uid uuid; expected text[]; observed text[]; reward int; prior text;
BEGIN
  SELECT a.id INTO uid FROM accounts a JOIN current_account(s) c ON c.id=a.id FOR UPDATE OF a;
  IF uid IS NULL THEN RETURN -1; END IF;
  CASE ch
    WHEN 'dawn' THEN expected:=ARRAY['a:end|b:start'];reward:=600;
    WHEN 'tide' THEN expected:=ARRAY['a:end|b:start','e:end|f:start'];reward:=800;prior:='dawn';
    WHEN 'parallax' THEN expected:=ARRAY['a:end|b:start','c:end|d:start','e:end|f:start'];reward:=1000;prior:='tide';
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

CREATE OR REPLACE FUNCTION nt_identity.redeem(s text,product text,rid uuid) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,nt_identity,pg_temp AS $$
DECLARE uid uuid; cost int; prev text; balance bigint;
BEGIN
  SELECT a.id INTO uid FROM accounts a JOIN current_account(s) c ON c.id=a.id FOR UPDATE OF a;
  IF uid IS NULL THEN RETURN -1; END IF;
  CASE product WHEN 'wasabi55' THEN cost:=600; WHEN 'snack-kit' THEN cost:=1400;
    WHEN 'sampler' THEN cost:=2200; WHEN 'backpack' THEN cost:=8800; ELSE RETURN -2; END CASE;
  IF rid IS NULL THEN RETURN -2; END IF;
  SELECT item INTO prev FROM point_events WHERE account_id=uid AND request_id=rid;
  IF FOUND THEN IF prev=product THEN RETURN 0; ELSE RETURN -4; END IF; END IF;
  SELECT COALESCE(sum(delta),0) INTO balance FROM point_events WHERE account_id=uid AND occurred_at<=now();
  IF balance < cost THEN RETURN -3; END IF;
  INSERT INTO point_events(event_id,account_id,item,request_id,delta) VALUES(uid||':order:'||rid,uid,product,rid,-cost);
  RETURN cost;
END $$;

