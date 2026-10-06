// Cloudflare Worker: geeft koersen van Yahoo Finance door aan je eigen app.
// Vervang JOUWNAAM door je GitHub-gebruikersnaam (kleine letters).
const ALLOWED = "https://JOUWNAAM.github.io";

export default {
  async fetch(req) {
    const cors = { "Access-Control-Allow-Origin": ALLOWED, "Vary": "Origin" };
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "GET", "Access-Control-Allow-Headers": "*" } });
    }
    const sym = new URL(req.url).searchParams.get("s");
    if (!sym || !/^[A-Za-z0-9.\-=^]{1,20}$/.test(sym)) {
      return new Response("ongeldig symbool", { status: 400, headers: cors });
    }
    const r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(sym) + "?interval=1d&range=5d",
      { headers: { "User-Agent": "Mozilla/5.0" }, cf: { cacheTtl: 30, cacheEverything: true } }
    );
    return new Response(r.body, { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
  }
};
