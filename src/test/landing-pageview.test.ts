import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/telemetry.functions", () => ({
  telemetryConfig: vi.fn().mockResolvedValue({ token: "tok", pixelId: "123" }),
}));
vi.mock("@/lib/marketing.functions", () => ({
  grantMarketing: vi
    .fn()
    .mockResolvedValue({ receipt: "receipt-1", expires: Date.now() + 86_400_000 }),
  withdrawMarketing: vi.fn().mockResolvedValue({ success: true }),
  checkMarketing: vi
    .fn()
    .mockImplementation(async ({ data }: { data: string }) => ({
      valid: data !== "stale-receipt",
    })),
}));

type Sent = { event_name: string; page_path: string; consent_level: string; fbc?: string };
let sent: Sent[] = [];

async function freshTracking(search = "") {
  vi.resetModules();
  window.history.replaceState(null, "", `/thermo-kesztyu${search}`);
  const track = await import("@/lib/track");
  track.initializeTracking();
  await new Promise((resolve) => setTimeout(resolve, 20));
  return track;
}

describe("first-visit landing measurement", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie.split("; ").forEach((c) => {
      document.cookie = `${c.split("=")[0]}=; Max-Age=0; path=/`;
    });
    document.head.querySelectorAll("script").forEach((s) => s.remove());
    delete (window as { fbq?: unknown }).fbq;
    delete (window as { _fbq?: unknown })._fbq;
    sent = [];
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: (_url: string, blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => sent.push(JSON.parse(String(reader.result)) as Sent);
        reader.readAsText(blob);
        return true;
      },
    });
  });

  it("sends nothing before a choice, then replays the landing PageView and ViewContent once marketing is accepted", async () => {
    const track = await freshTracking("?fbclid=abc123");
    track.track("ViewContent", { content_type: "product" });
    track.track("ViewContent", { content_type: "product" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sent).toHaveLength(0);

    await track.saveConsent(true, true);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sent.map((e) => e.event_name)).toEqual(["PageView", "ViewContent"]);
    expect(
      sent.every((e) => e.consent_level === "marketing" && e.page_path === "/thermo-kesztyu"),
    ).toBe(true);
    expect(sent[0]?.fbc).toMatch(/^fb\.1\.\d+\.abc123$/);

    const fbq = (window as unknown as { fbq: { queue: IArguments[] } }).fbq;
    const calls = fbq.queue.map((args) => Array.from(args));
    expect(calls.find((c) => c[0] === "init")?.[1]).toBe("123");
    expect(calls.filter((c) => c[0] === "track").map((c) => c[1])).toEqual([
      "PageView",
      "ViewContent",
    ]);
    expect(document.head.querySelector('script[src*="fbevents.js"]')).not.toBeNull();
  });

  it("discards the buffered landing events when the visitor refuses", async () => {
    const track = await freshTracking();
    await track.saveConsent(false, false);
    track.track("ViewContent");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sent).toHaveLength(0);
    expect((window as { fbq?: unknown }).fbq).toBeUndefined();
  });

  it("replays to first-party statistics only when just statistics is accepted", async () => {
    const track = await freshTracking();
    await track.saveConsent(true, false);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sent.map((e) => [e.event_name, e.consent_level])).toEqual([["PageView", "statistics"]]);
    expect((window as { fbq?: unknown }).fbq).toBeUndefined();
  });

  it("drops a stored marketing choice the server no longer honours and asks again", async () => {
    const stale = {
      statistics: true,
      marketing: true,
      expires: Date.now() + 86_400_000,
      receipt: "stale-receipt",
    };
    localStorage.setItem("cw_consent", JSON.stringify(stale));
    let reopened = 0;
    window.addEventListener("cw-consent", () => reopened++);
    const track = await freshTracking();
    expect(sent).toHaveLength(0);
    expect((window as { fbq?: unknown }).fbq).toBeUndefined();
    expect(localStorage.getItem("cw_consent")).toBeNull();
    expect(track.currentConsent()).toBeNull();
    expect(reopened).toBeGreaterThan(0);

    await track.saveConsent(true, true);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sent.map((e) => [e.event_name, e.consent_level])).toEqual([["PageView", "marketing"]]);
  });

  it("keeps a stored marketing choice the server confirms", async () => {
    const valid = {
      statistics: true,
      marketing: true,
      expires: Date.now() + 86_400_000,
      receipt: "receipt-1",
    };
    localStorage.setItem("cw_consent", JSON.stringify(valid));
    const track = await freshTracking();
    expect(track.currentConsent()?.marketing).toBe(true);
    expect(sent.map((e) => [e.event_name, e.consent_level])).toEqual([["PageView", "marketing"]]);
    expect((window as { fbq?: unknown }).fbq).toBeDefined();
  });
});
