CREATE OR REPLACE FUNCTION public.grant_marketing_permission(p_id uuid,p_visitor uuid,p_expires timestamptz,p_notice text,p_agent text,p_ip text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_visitor::text,0));
 UPDATE public.marketing_permissions SET revoked_at=coalesce(revoked_at,now()) WHERE visitor_id=p_visitor AND revoked_at IS NULL;
 UPDATE public.capi_deliveries SET status='suppressed',event_payload='{}'::jsonb,last_error='permission_superseded' WHERE consent_id IN (SELECT id FROM public.marketing_permissions WHERE visitor_id=p_visitor AND revoked_at IS NOT NULL) AND status IN ('pending','retry','sending');
 INSERT INTO public.marketing_permissions(id,visitor_id,expires_at,notice_version,user_agent,client_ip) VALUES(p_id,p_visitor,p_expires,p_notice,p_agent,p_ip);
END $$;
REVOKE ALL ON FUNCTION public.grant_marketing_permission(uuid,uuid,timestamptz,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.grant_marketing_permission(uuid,uuid,timestamptz,text,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.revoke_marketing_permission(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE visitor uuid;
BEGIN
 SELECT visitor_id INTO visitor FROM public.marketing_permissions WHERE id=p_id;
 IF visitor IS NULL THEN RETURN; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(visitor::text,0));
 UPDATE public.marketing_permissions SET revoked_at=coalesce(revoked_at,now()) WHERE visitor_id=visitor;
 UPDATE public.capi_deliveries SET status='suppressed',event_payload='{}'::jsonb,last_error='consent_revoked' WHERE consent_id IN (SELECT id FROM public.marketing_permissions WHERE visitor_id=visitor) AND status IN ('pending','retry','sending');
 UPDATE public.orders SET marketing_consent=false,fbp=NULL,fbc=NULL,fbclid=NULL,gclid=NULL,ttclid=NULL WHERE id IN (SELECT order_id FROM public.capi_deliveries WHERE consent_id IN (SELECT id FROM public.marketing_permissions WHERE visitor_id=visitor));
END $$;
REVOKE ALL ON FUNCTION public.revoke_marketing_permission(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_marketing_permission(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.replace_mirrored_order_items(p_order text,p_items jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_order,0));
 DELETE FROM public.order_items WHERE order_id=p_order;
 INSERT INTO public.order_items(order_id,product_title,variant_title,sku,quantity,price,discount) SELECT p_order,x.product_title,x.variant_title,x.sku,x.quantity,x.price,x.discount FROM jsonb_to_recordset(p_items) AS x(product_title text,variant_title text,sku text,quantity integer,price numeric,discount numeric);
END $$;
REVOKE ALL ON FUNCTION public.replace_mirrored_order_items(text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.replace_mirrored_order_items(text,jsonb) TO service_role;