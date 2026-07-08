# Loop

One button. A walk appears.

Loop generates a walking loop from where you are standing, sized to the time you have, never the same route twice, and starts a walk. There is one control: duration. Everything else gets out of the way.

The app is a single `index.html` with embedded CSS and vanilla JS, plus two small serverless functions in `api/` that proxy the routing calls. The routing key lives on the server and never reaches the browser.

## Getting a routing key

Loop draws routes with the OpenRouteService directions and geocoding APIs. You need one free key.

1. Make a free account at [openrouteservice.org](https://openrouteservice.org/).
2. In the dashboard, create a token.
3. Set it as an environment variable named `ORS_API_KEY`. On Vercel that is Project Settings, Environment Variables. Locally, put it in a `.env` file or run `vercel env pull`.

The same key covers directions and geocoding. Until the key is set, Loop shows a small setup note instead of failing silently. The key is read only by the functions in `api/`, so it is never sent to the browser.

## How routing stays private

The browser never talks to OpenRouteService directly. It calls two endpoints on this app:

- `POST /api/directions` proxies the round-trip and out-and-back directions calls.
- `GET /api/geocode?text=...` proxies address lookup when geolocation is denied.

Each function reads `ORS_API_KEY` from the server environment and forwards the request. A missing key returns a `503`, which the client turns into the setup note.

## Running locally

Because of the `api/` functions, use the Vercel CLI so the endpoints run:

```bash
vercel dev
```

Then open the printed `http://localhost:3000`. Geolocation needs a secure context, so `localhost` is fine and any deployed copy should be served over HTTPS. Make sure `ORS_API_KEY` is available locally (via `.env` or `vercel env pull`).

The map uses MapLibre GL JS and OpenStreetMap raster tiles, both loaded from a CDN, so the app needs a network connection on first load. Once a walk is generated its route is cached on the device, so signal loss mid walk does not break the walk.

## localStorage schema

Everything Loop remembers lives on the device under a single key, `loop.v1`:

```jsonc
{
  "duration": 20,            // last chosen duration in minutes (15, 20, 30, or 45)
  "manualAddress": "",       // last typed start, remembered if geolocation is denied
  "walks": [
    {
      "date": "2026-07-08T18:40:00.000Z", // ISO timestamp
      "duration": 20,                      // minutes
      "polyline": [[lng, lat], /* ... */], // the route geometry
      "completed": true                    // false for a walk ended early
    }
  ]
}
```

A second transient key, `loop.v1.current`, caches the active route while a walk is in progress and is cleared when the walk ends.

Nothing leaves the device except the coordinates sent through the routing proxy to OpenRouteService. No accounts, no analytics, no history on any server.

## Portfolio screenshots

A dev-only helper seeds the shelf with twelve plausible fake shapes for screenshots. Open the browser console and run:

```js
__loopSeedShelf()
```

It is clearly marked in the source and should be removed before shipping.
