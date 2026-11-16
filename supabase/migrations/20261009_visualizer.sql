BEGIN;
CREATE TABLE IF NOT EXISTS public.visualizer_admins(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE);
ALTER TABLE public.visualizer_admins ENABLE ROW LEVEL SECURITY;
INSERT INTO public.visualizer_admins(user_id) SELECT id FROM auth.users WHERE lower(email)='den.velikiy562381@gmail.com' AND email_confirmed_at IS NOT NULL ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.is_site_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT EXISTS(SELECT 1 FROM public.visualizer_admins WHERE user_id=auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_site_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_site_admin() TO anon,authenticated;
DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM public.visualizer_admins) THEN RAISE EXCEPTION 'No verified owner found. Confirm the existing owner account before running this migration.'; END IF; END $$;
CREATE TABLE public.visualizer_access (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 access_status text NOT NULL DEFAULT 'PENDING' CHECK(access_status IN ('PENDING','ACTIVE','SUSPENDED','EXPIRED','REVOKED')),
 access_start timestamptz, access_expires timestamptz,
 access_type text NOT NULL DEFAULT 'TEMPORARY' CHECK(access_type IN ('PERMANENT','TEMPORARY')),
 granted_by uuid REFERENCES auth.users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(access_status <> 'ACTIVE' OR (access_start IS NOT NULL AND (access_type='PERMANENT' OR access_expires>access_start)))
);
ALTER TABLE public.visualizer_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_access ON public.visualizer_access FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.is_site_admin());
CREATE TABLE public.visualizer_presets(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,config jsonb NOT NULL,published boolean NOT NULL DEFAULT false,disabled boolean NOT NULL DEFAULT false,is_default boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.visualizer_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY published_presets ON public.visualizer_presets FOR SELECT TO authenticated USING((published AND NOT disabled) OR public.is_site_admin());
CREATE TABLE public.visualizer_audit(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor uuid REFERENCES auth.users(id),action text NOT NULL,target text,details jsonb,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.visualizer_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_audit ON public.visualizer_audit FOR SELECT TO authenticated USING(public.is_site_admin());
-- Service-role routes alone write access/presets; this trigger makes every mutation auditable atomically.
CREATE FUNCTION public.audit_visualizer() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 INSERT INTO public.visualizer_audit(actor,action,target,details) VALUES ((nullif(current_setting('request.headers',true),'')::jsonb->>'x-admin-id')::uuid,TG_TABLE_NAME||':'||TG_OP,coalesce(to_jsonb(NEW)->>'user_id',to_jsonb(OLD)->>'user_id',to_jsonb(NEW)->>'id',to_jsonb(OLD)->>'id'),jsonb_build_object('before',to_jsonb(OLD),'after',to_jsonb(NEW)));
 RETURN coalesce(NEW,OLD);
END; $$;
-- Actor identity is supplied only by authenticated server routes through the service client.
CREATE TRIGGER access_audit AFTER INSERT OR UPDATE OR DELETE ON public.visualizer_access FOR EACH ROW EXECUTE FUNCTION public.audit_visualizer();
CREATE TRIGGER preset_audit AFTER INSERT OR UPDATE OR DELETE ON public.visualizer_presets FOR EACH ROW EXECUTE FUNCTION public.audit_visualizer();
CREATE FUNCTION public.register_visualizer_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN INSERT INTO public.visualizer_access(user_id) VALUES(NEW.id) ON CONFLICT DO NOTHING; RETURN NEW; END; $$;
CREATE TRIGGER register_visualizer_user AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.register_visualizer_user();
-- Add restrictive guards so legacy permissive policies can never grant new users site-admin access.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['works','drum_kits','drum_kit_tracks','site_settings','wutshy_settings'] LOOP
 IF to_regclass('public.'||t) IS NOT NULL THEN
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY visualizer_admin_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.is_site_admin())',t);
 EXECUTE format('CREATE POLICY visualizer_admin_update ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.is_site_admin()) WITH CHECK(public.is_site_admin())',t);
 EXECUTE format('CREATE POLICY visualizer_admin_delete ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING(public.is_site_admin())',t);
 END IF; END LOOP;
 IF to_regclass('public.wutshy_settings') IS NOT NULL THEN
 EXECUTE 'CREATE POLICY hide_secrets ON public.wutshy_settings AS RESTRICTIVE FOR SELECT TO anon,authenticated USING(key NOT IN (''telegram'',''contact_smtp_encrypted'') OR public.is_site_admin())';
 END IF;
END $$;
CREATE UNIQUE INDEX one_visualizer_default ON public.visualizer_presets(is_default) WHERE is_default;
CREATE FUNCTION public.save_visualizer_preset(p_id uuid,p_name text,p_config jsonb,p_published boolean,p_disabled boolean,p_default boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(781219);
 IF p_default THEN UPDATE public.visualizer_presets SET is_default=false WHERE is_default AND id IS DISTINCT FROM p_id; END IF;
 INSERT INTO public.visualizer_presets(id,name,config,published,disabled,is_default) VALUES(coalesce(p_id,gen_random_uuid()),p_name,p_config,p_published,p_disabled,p_default)
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,config=excluded.config,published=excluded.published,disabled=excluded.disabled,is_default=excluded.is_default;
END; $$;
REVOKE ALL ON FUNCTION public.save_visualizer_preset(uuid,text,jsonb,boolean,boolean,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_visualizer_preset(uuid,text,jsonb,boolean,boolean,boolean) TO service_role;
CREATE POLICY visualizer_storage_insert ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.is_site_admin());
CREATE POLICY visualizer_storage_update ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.is_site_admin()) WITH CHECK(public.is_site_admin());
CREATE POLICY visualizer_storage_delete ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated USING(public.is_site_admin());
GRANT SELECT ON public.visualizer_access,public.visualizer_presets,public.visualizer_audit TO authenticated;
GRANT ALL ON public.visualizer_admins,public.visualizer_access,public.visualizer_presets,public.visualizer_audit TO service_role;
GRANT USAGE,SELECT ON SEQUENCE public.visualizer_audit_id_seq TO service_role;
REVOKE ALL ON FUNCTION public.audit_visualizer(),public.register_visualizer_user() FROM PUBLIC;
CREATE TABLE public.visualizer_action_limits(user_id uuid NOT NULL,scope text NOT NULL,bucket bigint NOT NULL,hits integer NOT NULL DEFAULT 1,PRIMARY KEY(user_id,scope,bucket));
ALTER TABLE public.visualizer_action_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.visualizer_rate_limit(p_user uuid,p_scope text,p_limit integer) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE current_bucket bigint := floor(extract(epoch FROM now())/60); total integer;
BEGIN
 DELETE FROM public.visualizer_action_limits WHERE bucket<current_bucket-10;
 INSERT INTO public.visualizer_action_limits(user_id,scope,bucket) VALUES(p_user,p_scope,current_bucket)
 ON CONFLICT(user_id,scope,bucket) DO UPDATE SET hits=visualizer_action_limits.hits+1 RETURNING hits INTO total;
 RETURN total<=p_limit;
END; $$;
REVOKE ALL ON FUNCTION public.visualizer_rate_limit(uuid,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.visualizer_rate_limit(uuid,text,integer) TO service_role;
COMMIT;
