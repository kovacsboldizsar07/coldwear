import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_CONSENT_VERSION,
  DEFAULT_SIGNUP_COUPON,
  normalizeEmail,
} from "./newsletter-rules";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().trim().max(254).email(),
      consent: z.literal(true),
      consentVersion: z.literal(NEWSLETTER_CONSENT_VERSION),
      pagePath: z.string().max(500),
      // Honeypot: real visitors never see or fill it.
      website: z.string().max(200).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request.headers.get("origin") !== new URL(request.url).origin)
      throw new Error("Érvénytelen kérés.");
    const code = process.env["CW_SIGNUP_COUPON"] || DEFAULT_SIGNUP_COUPON;
    if (data.website) return { code };
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;
    // Re-subscribing with the same address keeps the original consent record and simply shows the code again.
    const { error } = await db.from("newsletter_subscribers").upsert(
      {
        email: normalizeEmail(data.email),
        consent_version: NEWSLETTER_CONSENT_VERSION,
        consent_text: NEWSLETTER_CONSENT_TEXT,
        source: "exit_popup",
        page_path: data.pagePath,
        user_agent: (request.headers.get("user-agent") ?? "").slice(0, 1024),
        client_ip: ip,
      },
      { onConflict: "email", ignoreDuplicates: true },
    );
    if (error) throw new Error("A feliratkozás most nem sikerült. Próbáld újra pár perc múlva.");
    return { code };
  });
