import { describe, expect, it } from "vitest";
import { EXIT_POPUP_COOLDOWN_DAYS, exitPopupAllowed, normalizeEmail } from "@/lib/newsletter-rules";

describe("exit popup rules", () => {
  it("shows the popup to a first-time visitor", () => expect(exitPopupAllowed(null)).toBe(true));
  it("waits out the cooldown after a dismissal", () => {
    const now = Date.parse("2026-11-24T10:00:00Z");
    expect(exitPopupAllowed(now - 86_400_000, now)).toBe(false);
    expect(exitPopupAllowed(now - (EXIT_POPUP_COOLDOWN_DAYS + 1) * 86_400_000, now)).toBe(true);
  });
  it("stores addresses in one canonical form", () =>
    expect(normalizeEmail("  Anna.Kovacs@Gmail.COM ")).toBe("anna.kovacs@gmail.com"));
});
