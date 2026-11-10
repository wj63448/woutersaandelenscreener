// © 2026 Wouter Janssens. Alle rechten voorbehouden. Niet kopiëren of verspreiden zonder toestemming. Contact: wj.apps.store@gmail.com
// Cloudflare Worker: geeft koersen van Yahoo Finance door aan je eigen app.
// Toegangssleutels: voeg in Cloudflare (Settings > Variables and Secrets) een secret "KEYS" toe met een of meer
// sleutels, gescheiden door een komma (bv. "sleutel1,sleutel2"). Staat KEYS niet ingesteld, dan is er geen controle.
// Een sleutel intrekken = hem uit KEYS verwijderen.
const ALLOWED = "https://wj63448.github.io";
const RANGES = ["5d", "1mo", "3mo", "1y"];

export default {
  async fetch(req, env) {
    const cors = { "Access-Control-Allow-Origin": ALLOWED, "Vary": "Origin" };
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "GET", "Access-Control-Allow-Headers": "X-Key", "Access-Control-Max-Age": "7200" } });
    }
    const keys = String((env && env.KEYS) || "").split(",").map(x => x.trim()).filter(Boolean);
    if (keys.length && !keys.includes(req.headers.get("X-Key") || "")) {
      return new Response("toegang geweigerd", { status: 401, headers: cors });
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
