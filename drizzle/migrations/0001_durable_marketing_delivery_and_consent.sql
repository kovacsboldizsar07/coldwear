CREATE TABLE public.marketing_permissions (
 id uuid PRIMARY KEY, visitor_id uuid NOT NULL, accepted_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, revoked_at timestamptz, notice_version text NOT NULL DEFAULT 'coldwear-meta-2026-10-18', user_agent text, client_ip text
);
GRANT ALL ON public.marketing_permissions TO service_role;
ALTER TABLE public.marketing_permissions ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.capi_deliveries (
 event_id text PRIMARY KEY, event_name text NOT NULL, order_id text, consent_id uuid NOT NULL REFERENCES public.marketing_permissions(id), event_time bigint NOT NULL, event_payload jsonb NOT NULL, status text NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz, lease_token uuid, sent_at timestamptz, last_error text, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.capi_deliveries TO service_role;
ALTER TABLE public.capi_deliveries ENABLE ROW LEVEL SECURITY;
CREATE INDEX capi_deliveries_due ON public.capi_deliveries(status, next_attempt_at);
ALTER TABLE public.webhook_events ADD COLUMN lease_until timestamptz;
ALTER TABLE public.webhook_events ADD COLUMN lease_token uuid;
CREATE OR REPLACE FUNCTION public.claim_capi_delivery(p_event_id text DEFAULT NULL) RETURNS SETOF public.capi_deliveries LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 UPDATE public.capi_deliveries d SET status='suppressed', event_payload='{}'::jsonb, last_error='consent_expired_or_revoked' WHERE d.status IN ('pending','retry','sending') AND EXISTS (SELECT 1 FROM public.marketing_permissions p WHERE p.id=d.consent_id AND (p.revoked_at IS NOT NULL OR p.expires_at<=now()));
 UPDATE public.capi_deliveries SET status='expired', event_payload='{}'::jsonb, last_error='delivery_window_expired' WHERE status IN ('pending','retry','sending') AND event_time<extract(epoch FROM now()-interval '47 hours');
 RETURN QUERY WITH candidate AS (SELECT d.event_id FROM public.capi_deliveries d JOIN public.marketing_permissions p ON p.id=d.consent_id WHERE (p_event_id IS NULL OR d.event_id=p_event_id) AND p.revoked_at IS NULL AND p.expires_at>now() AND ((d.status IN ('pending','retry') AND d.next_attempt_at<=now()) OR (d.status='sending' AND d.lease_until<=now())) AND d.attempts<12 ORDER BY d.next_attempt_at LIMIT 1 FOR UPDATE OF d SKIP LOCKED) UPDATE public.capi_deliveries d SET status='sending', attempts=d.attempts+1, lease_until=now()+interval '2 minutes', lease_token=gen_random_uuid() FROM candidate c WHERE d.event_id=c.event_id RETURNING d.*;
END $$;
REVOKE ALL ON FUNCTION public.claim_capi_delivery(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_capi_delivery(text) TO service_role;
CREATE OR REPLACE FUNCTION public.claim_shopify_webhook(p_id text,p_topic text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE claimed uuid;
BEGIN
 INSERT INTO public.webhook_events(webhook_id,topic,status,lease_until,lease_token) VALUES(p_id,p_topic,'processing',now()+interval '2 minutes',gen_random_uuid()) ON CONFLICT(webhook_id) DO UPDATE SET status='processing',error=NULL,lease_until=now()+interval '2 minutes',lease_token=gen_random_uuid() WHERE webhook_events.topic=EXCLUDED.topic AND (webhook_events.status='error' OR (webhook_events.status='processing' AND coalesce(webhook_events.lease_until,webhook_events.received_at+interval '2 minutes')<=now())) RETURNING lease_token INTO claimed;
 RETURN claimed;
END $$;
REVOKE ALL ON FUNCTION public.claim_shopify_webhook(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_shopify_webhook(text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.revoke_marketing_permission(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.marketing_permissions SET revoked_at=coalesce(revoked_at,now()) WHERE id=p_id;
 UPDATE public.capi_deliveries SET status='suppressed',event_payload='{}'::jsonb,last_error='consent_revoked' WHERE consent_id=p_id AND status IN ('pending','retry','sending');
 UPDATE public.orders SET marketing_consent=false,fbp=NULL,fbc=NULL,fbclid=NULL,gclid=NULL,ttclid=NULL WHERE id IN (SELECT order_id FROM public.capi_deliveries WHERE consent_id=p_id);
END $$;
REVOKE ALL ON FUNCTION public.revoke_marketing_permission(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_marketing_permission(uuid) TO service_role;