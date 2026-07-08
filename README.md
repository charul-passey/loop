# Loop

One button. A walk appears.

Loop generates a walking loop from where you are standing, sized to the time you have, never the same route twice, and starts a walk. There is one control: duration. Everything else gets out of the way.

The whole app is a single `index.html` with embedded CSS and vanilla JS. No build step, no framework.

## Getting a routing key

Loop draws routes with the OpenRouteService directions API. You need a free key.

1. Make a free account at [openrouteservice.org](https://openrouteservice.org/).
2. In the dashboard, create a token.
3. Open `index.html` and paste it into the constant near the top of the script:

   ```js
   const ORS_API_KEY = "your-key-here";
   ```

The same key covers directions and geocoding. Until a key is present, Loop shows a small setup note instead of failing silently.

## Running locally

Any static file server works, since the app is one HTML file. From this directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Geolocation needs a secure context, so `localhost` is fine and any deployed copy should be served over HTTPS.

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

Nothing leaves the device except the coordinates sent in the routing API call. No accounts, no analytics, no server.

## Portfolio screenshots

A dev-only helper seeds the shelf with twelve plausible fake shapes for screenshots. Open the browser console and run:

```js
__loopSeedShelf()
```

It is clearly marked in the source and should be removed before shipping.
