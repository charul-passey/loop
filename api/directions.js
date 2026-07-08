// Serverless proxy for OpenRouteService directions.
// The routing key lives here on the server and never reaches the browser.
// Set ORS_API_KEY in the Vercel project. See the README.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method" });
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
