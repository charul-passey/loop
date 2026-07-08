// Serverless proxy for OpenRouteService geocoding.
// The routing key lives here on the server and never reaches the browser.
// Set ORS_API_KEY in the Vercel project. See the README.
module.exports = async (req, res) => {
  const key = process.env.ORS_API_KEY;
  if (!key) {
    res.status(503).json({ error: "no_key" });
    return;
  }
  const text = (req.query && req.query.text ? String(req.query.text) : "").trim();
  if (!text) {
    res.status(400).json({ error: "text" });
    return;
  }
  try {
    const url = "https://api.openrouteservice.org/geocode/search?api_key=" +
      encodeURIComponent(key) + "&size=1&text=" + encodeURIComponent(text);
    const upstream = await fetch(url);
    const body = await upstream.text();
    res.status(upstream.status).setHeader("Content-Type", "application/json").send(body);
  } catch (e) {
    res.status(502).json({ error: "upstream" });
  }
};
