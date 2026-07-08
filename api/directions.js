// Serverless proxy for OpenRouteService directions.
// The routing key lives here on the server and never reaches the browser.
// Set ORS_API_KEY in the Vercel project. See the README.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method" });
    return;
  }
  // A warm-up ping from the page load. It primes both this function and the
  // outbound connection to OpenRouteService with one tiny request, so the
  // real walk a few seconds later is fast instead of paying the cold cost.
  if (req.body && req.body.warm) {
    const warmKey = process.env.ORS_API_KEY;
    if (warmKey) {
      try {
        await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
          method: "POST",
          headers: {
            "Authorization": warmKey,
            "Content-Type": "application/json",
            "Accept": "application/geo+json"
          },
          body: JSON.stringify({
            coordinates: [[-0.1276, 51.5072]],
            options: { round_trip: { length: 400, points: 3, seed: 1 } }
          })
        });
      } catch (e) {}
    }
    res.status(200).json({ warm: true });
    return;
  }
  const key = process.env.ORS_API_KEY;
  if (!key) {
    res.status(503).json({ error: "no_key" });
    return;
  }
  try {
    const upstream = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
      method: "POST",
      headers: {
        "Authorization": key,
        "Content-Type": "application/json",
        "Accept": "application/geo+json"
      },
      body: JSON.stringify(req.body || {})
    });
    const body = await upstream.text();
    res.status(upstream.status).setHeader("Content-Type", "application/json").send(body);
  } catch (e) {
    res.status(502).json({ error: "upstream" });
  }
};
