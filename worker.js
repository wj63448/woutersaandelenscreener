// Cloudflare Worker: geeft koersen van Yahoo Finance door aan je eigen app.
// Vervang JOUWNAAM door je GitHub-gebruikersnaam (kleine letters, zonder spaties).
const ALLOWED = "https://wj63448.github.io";
const RANGES = ["5d", "1mo", "3mo", "1y"];

export default {
  async fetch(req) {
    const cors = { "Access-Control-Allow-Origin": ALLOWED, "Vary": "Origin" };
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "GET", "Access-Control-Allow-Headers": "*" } });
    }
    const u = new URL(req.url);
    const sym = u.searchParams.get("s");
    const range = RANGES.includes(u.searchParams.get("r")) ? u.searchParams.get("r") : "5d";
    if (!sym || !/^[A-Za-z0-9.\-=^]{1,20}$/.test(sym)) {
      return new Response("ongeldig symbool", { status: 400, headers: cors });
    }
    const pre = u.searchParams.get("pre") === "1";
    const qs = pre ? "?interval=5m&range=1d&includePrePost=true" : "?interval=1d&range=" + range;
    const r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(sym) + qs,
      { headers: { "User-Agent": "Mozilla/5.0" }, cf: { cacheTtl: 30, cacheEverything: true } }
    );
    return new Response(r.body, { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
  }
};
