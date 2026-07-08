# Claude Code prompt: build Loop v1

Copy everything below the line into Claude Code from an empty project directory.

---

Build a mobile-first web app called Loop. One button generates a walking loop from the user's current location, sized to the time they have, never the same route twice, and starts a walk. Read this whole brief before writing code, then build exactly this and nothing more.

## Product rules, non-negotiable

1. One screen, one action. The idle screen contains only: the wordmark "Loop" small at top, a duration readout, and one large circular Walk button. Nothing else. No nav, no settings, no menu, no onboarding.
2. The only control is duration. Tapping the duration cycles 15, 20, 30, 45 minutes. Persist the last choice in localStorage so returning users are one tap from walking.
3. Time from page open to walking must feel under ten seconds. Request geolocation on Walk press, not on page load.
4. No streaks, no badges, no step counts, no calories, no social features, no accounts, no analytics. Do not add any of these even as placeholders.
5. Copy never guilts. No "you haven't walked in a while," no red, no warnings styled as failure. An abandoned walk is saved, slightly faded, without comment.

## Architecture

- Single index.html with embedded CSS and JS. No build step, no framework. Vanilla JS only.
- MapLibre GL JS from CDN for the map. OpenStreetMap raster tiles via a free style (use the demotiles or OSM raster style, keep attribution visible).
- Routing: OpenRouteService v2 directions API, profile foot-walking, GeoJSON endpoint, using round_trip options. Put the API key in a single const ORS_API_KEY = "" at the top of the script with a comment pointing to openrouteservice.org for a free key. If the key is empty, show a small setup note instead of failing silently.
- Request shape: POST https://api.openrouteservice.org/v2/directions/foot-walking/geojson with body { coordinates: [[lng, lat]], options: { round_trip: { length: meters, points: 4, seed: randomInt } } }. Length = minutes * 80.
- All state in localStorage under a single namespaced key. Store: last duration, and an array of completed walks, each with date, duration, coordinates polyline, and a completed or partial flag.

## Route novelty

After generating a route, compare its geometry to stored past routes: sample each polyline to about 40 points, count how many sampled points of the new route fall within 30 meters of any point of a past route, and treat over 60 percent as too similar. Regenerate with a new seed, up to 3 attempts, then accept the best (least similar) candidate. Keep this logic simple and readable.

## States and flow

1. Idle. Duration + Walk button. Background is paper, button is teal.
2. Generating. Button becomes a quiet line-drawing animation while the API resolves. If generation takes over 6 seconds, show "still drawing your loop." On failure after retries, offer an out-and-back: route out for half the distance along the best available path and back, with the copy "Today is an out-and-back."
3. Walking. Full-bleed map. Route as a 4px teal line, user as a soft dot, elapsed time small at top in mono. One small End button, low prominence. Poll position with watchPosition, throttled to roughly every 5 seconds for battery. Cache the route locally the moment it is generated so signal loss does not break the walk.
4. Done. Trigger when the user re-enters a 75 meter radius of the start, or on End. The route lifts off the map: render the polyline alone, normalized and centered, as a minimal line drawing on paper, hold it for a beat, then slide it onto the shelf.
5. Shelf. Reached by swiping up or tapping a small "shelf" label on idle. A grid of past walk shapes, each drawn as a small SVG from its stored polyline, dated in mono type. Partial walks render at 40 percent opacity. Tapping a shape shows it large with date and duration. Include a share action that exports the shape as a PNG image (canvas render), nothing else.

## Edge cases to handle explicitly

- Geolocation denied: show a single input for an address or landmark, geocode it through the ORS geocoding endpoint, remember it.
- After sunset at the user's location, switch to a dark map style and dark UI. Compute sunset roughly from latitude and date, no API needed, approximation is fine.
- Empty shelf state: the copy is "Your first shape is one button away." Nothing more.

## Design direction

This must not look like a template or a fitness app. It should feel like a quiet instrument.

- Palette: paper #EBEEF2 background, ink #14181C for type, teal #0E6E78 exclusively for the Walk button and the route line, one warm neutral #C9C2B6 for hairlines and secondary marks. Teal is action only. Nothing else on the screen may be teal.
- Type: Space Grotesk for the wordmark and duration numeral, Space Mono for timestamps, dates, and elapsed time. Load from Google Fonts. The duration numeral is the largest type on the idle screen after the button.
- Signature element: the Walk button is a perfect circle with a hand-drawn-feeling loop icon (a single imperfect closed curve, drawn as an SVG path, subtly different rotation on each page load, foreshadowing that no two loops repeat). This is the one place the design spends its boldness. Everything else is quiet, precise spacing, generous whitespace.
- Motion: exactly two orchestrated moments. The generating animation (the loop icon draws itself using stroke-dashoffset) and the done ceremony (route lifting off the map onto the shelf). No other animation. Respect prefers-reduced-motion by replacing both with simple fades.
- The done ceremony is the emotional peak of the product. Spend real effort on the polyline-to-line-drawing normalization so every shape looks intentional: scale to fit a square, center, uniform stroke, rounded caps.
- Quality floor without announcing it: responsive from 360px up, visible keyboard focus states, all tap targets at least 44px, map attribution intact.
- Microcopy register: plain, warm, sentence case, short. Never exclamation marks. Never apologies. No em dashes or en dashes anywhere in the interface or the code comments.

## Delivery

- Produce index.html plus a short README.md covering: getting an ORS key, running locally (any static server), and the localStorage schema.
- Test the three portfolio screenshots are achievable: idle screen, walking at dusk (dark map), shelf with multiple shapes. Include a small dev-only helper (a function callable from the console, not visible in the UI) that seeds the shelf with 12 plausible fake shapes for screenshot purposes, clearly marked for removal.
- Before finishing, self-review against the product rules section and remove anything that crept in beyond the spec.
