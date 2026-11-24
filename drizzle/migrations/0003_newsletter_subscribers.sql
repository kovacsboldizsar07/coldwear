-- Exit popup sign-ups: e-mail + the exact consent text shown, for the free-shipping coupon offer.
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE CHECK (email = lower(email)),
 consent_version text NOT NULL,
 consent_text text NOT NULL,
 source text NOT NULL DEFAULT 'exit_popup',
 page_path text,
 user_agent text,
 client_ip text,
 created_at timestamptz NOT NULL DEFAULT now(),
 unsubscribed_at timestamptz
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_read ON public.newsletter_subscribers;
CREATE POLICY admin_read ON public.newsletter_subscribers FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
REVOKE ALL ON public.newsletter_subscribers FROM anon;
