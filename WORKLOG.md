# Loop — Work Log

A chronological record of everything done on Loop from the first local server run
through the pull-to-refresh feature.

- **App:** Loop — one button, a walking loop appears
- **Live:** https://loop.charulpassey.com (also https://loop-six-tau.vercel.app)
- **Repo:** https://github.com/charul-passey/loop (public, branch `main`)
- **Stack:** single `index.html` (vanilla JS, MapLibre GL), two serverless
  proxies in `api/`, deployed on Vercel
- **Date:** 2026-07-08 (all work in one session)

Times are approximate. Commit hashes are the real ones on `main`.

---

## Build and first run

**~08:40 — Initial build (from LOOP-BUILD-PROMPT.md / LOOP-PRD.md)**
- Built `index.html` and `README.md`: mobile-first single-page app, one teal
  Walk button, duration cycling (15/20/30/45), MapLibre map, OpenRouteService
  round-trip routing, route-novelty check, walking/done/shelf states, dusk dark
  theme, localStorage history, dev-only shelf seeder.
- Verified JS syntax and structure; scanned against the product rules (no
  streaks/badges/analytics, no em/en dashes, teal used only for the Walk button
  and route line — moved the focus ring and sheet buttons off teal to comply).

**~08:45 — First local server attempt**
- Ran `python3 -m http.server`. First tries returned HTTP 000 and one call hung.
- Diagnosis: two separate problems — (1) the server is long-running so it must be
  backgrounded, and (2) the agent's Bash sandbox isolates the network, so a
  sandboxed `curl` to localhost cannot connect.
- Fix: ran the server in the background with the sandbox disabled. Confirmed
  HTTP 200 serving on http://localhost:8000.

**~08:50 — API key**
- User pasted their OpenRouteService key into `index.html`.
- Validated the key with a live round-trip request to ORS: got a valid closed
  loop back, so the key worked.

---

## First deploy and repository

**~08:55 — Vercel production deploy**
- Deployed to Vercel (`vercel --prod`, scope `charul-passeys-projects`).
- Auto-aliased to `loop-six-tau.vercel.app`; set the clean alias
  `loop-charul-passeys-projects.vercel.app`.
- Found the clean team alias sits behind Vercel Authentication (SSO), so
  `loop-six-tau.vercel.app` became the public shareable link.

**~08:55 — GitHub repo (commit 91c63e7 "Loop v1")**
- Decision surfaced: a client-side app ships the key to the browser, and putting
  a live key in a public git history invites scraping. User chose a public repo.
- Blanked the key in the committed `index.html` (the live Vercel copy kept its
  key), added `.gitignore` (`.vercel`, `.DS_Store`), created the public repo
  `charul-passey/loop`, and pushed. Verified no key in tracked files.

**~09:00 — Branch rename**
- Renamed `master` → `main` locally and on the remote, set GitHub's default
  branch to `main`, deleted the old `master`.

---

## Hardening and features

**09:07 — Serverless proxy for the API key (commit c300f64)**
- User chose to fully hide the key rather than just keep it out of the repo.
- Added `api/directions.js` and `api/geocode.js`: thin proxies that read
  `ORS_API_KEY` from the server environment and forward to ORS. The browser now
  calls `/api/directions` and `/api/geocode`; the key never reaches the client.
  A `503` from a proxy surfaces the existing setup note.
- Recovered the key from the still-live deployment, set `ORS_API_KEY` as a Vercel
  env var (production, preview, development), redeployed, and verified: proxy
  returns real routes/geocode, served HTML contains no key, repo contains no key.
- Updated README for the env-var + `vercel dev` local workflow.

**09:17 — Address autocomplete + sheet transition (commit 21c9320)**
- The geolocation-denied address prompt now fetches ranked suggestions as you
  type (debounced), tap one to lock in its exact coordinates. Switched the
  geocode proxy to the ORS autocomplete endpoint.
- Gave the prompt sheet a fade + slide-in transition instead of appearing
  abruptly; slide dropped under prefers-reduced-motion.

**09:23 — Faster loop creation (commit 6a0cb4f)**
- Reported: loop creation was slow. Measured it.
- Start fix now uses a fast low-accuracy geolocation call (a GPS lock was the
  main delay); walk tracking stays high-accuracy.
- Route generation fetches the first candidate alone and only fans out the
  remaining novelty retries concurrently if the first is too similar, so a repeat
  walk never waits on three sequential requests.

**09:29 — Warm the ORS path on load (commit fd4593d)**
- Measurement showed the real cost was the FIRST routing request after idle
  (~9–13s) while warm requests were ~0.5s — a cold serverless + ORS connection.
- Page load now fires a fire-and-forget warm-up that makes one tiny ORS request
  server-side, priming the function and the outbound connection. Verified: on a
  cold deploy the warm-up absorbed the cost and the real walk returned in ~0.7s.

**09:33 — Map filled zero size (commit 8b552c5)**
- Bug: the map was created while its screen was still `display:none`, so MapLibre
  measured a 0x0 container and never filled the viewport.
- Fix: show the walking screen before creating the map, and call `map.resize()`
  when the route is applied (covers reused maps and orientation changes).

**09:37 — False night / dark theme in daytime (commit 08a6d68)**
- Bug: pressing Walk in the afternoon flipped the app to the dark theme.
- Cause: the sunrise/sunset check compared UTC times without wrapping across the
  day boundary, so for western longitudes late-afternoon daylight read as night.
- Fix: compare the circular distance from solar noon (wrapped into ±12h).
  Verified SF stays light until ~9pm, London until ~9pm+ (matching real sunsets).

---

## Shelf redesign

**09:47 — Shelf becomes a draggable bottom sheet (commit ac34c73)**
- Replaced the abrupt full-screen shelf with a bottom sheet: three snap points
  (closed / half / full), drag the grabber or header, flick or release to snap,
  tap the scrim to close. A bobbing chevron above the "shelf" label hints at the
  pull. Detail view layers above the sheet. The done ceremony returns to idle and
  pulls the sheet to half to reveal the new shape. Chevron respects
  prefers-reduced-motion.

**09:50 — Tighten shelf rows, pass 1 (commit 19f5348)**
- Reduced cell vertical padding and the date margin (rows still felt loose).

**09:57 — Drag from anywhere + duration per shape (commit f415caa)**
- The whole sheet is draggable, not just the grabber; a drag on the grid moves
  the sheet unless it is full with room to scroll, where it scrolls the grid
  instead (panel uses `touch-action: none`; grid scrolled by hand so gestures
  never fight). A drag that starts on a shape no longer opens its detail.
- Each shape now shows its walk duration beside the date.

**10:04 — Bounding-box shapes fix the row spacing (commit 26a3b39)**
- Root cause of the wide rows: every loop was drawn into a forced square SVG, so
  a wide/elongated loop sat as a thin band in a tall square with large empty
  areas inside the SVG that no CSS could remove.
- Fix: render each shelf shape into a box whose height follows the shape (width
  filled, tall shapes capped), so the cell is only as tall as the drawing.
  Verified the projection math (0.25/0.50/0.75 at a square's corners).

---

## Walking polish

**10:10 — Smooth location dot (commit be05f22)**
- The dot jumped to each reading on a 5s throttle. Now it glides from its current
  spot to each new GPS reading with `requestAnimationFrame` over roughly the time
  since the last reading, so it walks along the path. Jumps instantly under
  prefers-reduced-motion; cancelled when the walk ends. (Q&A first confirmed the
  dot tracks real GPS, ~5s steps, not snapped to the line, map does not follow.)

**10:16 — Colour the walked route (commit 2f069d1)**
- The route uses a MapLibre `line-gradient` driven by how far along the loop you
  are. Starts fully teal; the part behind you turns to the warm neutral, so teal
  always marks the way ahead. Progress is forward-only so GPS jitter and the loop
  closing near the start cannot run the colour backward. Colour restored after a
  restyle. On-palette: teal stays action-only, neutral is the secondary mark.

---

## Custom domain, Git, icons

**~10:40 — Custom domain loop.charulpassey.com**
- `charulpassey.com` is on the Vercel account but DNS is managed at Cloudflare
  (nameservers are Cloudflare, not Vercel), matching the existing
  `govern.charulpassey.com` pattern.
- Attached `loop.charulpassey.com` to the `loop` project on Vercel.
- Recommended a CNAME (not the A record Vercel's CLI defaulted to): a CNAME
  points at a Vercel-owned hostname that Vercel keeps current, is the convention
  for subdomains, and matches `govern`. (An A record is only forced on the apex,
  which cannot take a CNAME.) User added `CNAME loop -> cname.vercel-dns.com`,
  DNS-only (grey cloud).
- Verified: authoritative Cloudflare NS + 1.1.1.1 + 8.8.8.8 all resolve to
  Vercel edge IPs (not proxied), HTTPS 200 with valid SSL, Loop serves, and the
  `/api` proxy works on the custom domain.

**~10:55 — Vercel ↔ GitHub connection**
- Found the project was NOT connected to Git — every deploy so far was via CLI.
- Ran `vercel git connect`; connected `github.com/charul-passey/loop`. Now pushes
  to `main` auto-deploy to production and branches/PRs get preview deployments.

**11:08 — Favicon and app icons (commit f2b223e)**
- Created the app icon: the teal Walk button with its hand-drawn paper loop.
  Rendered the SVG to PNG with macOS `qlmanage`. Shipped `favicon.svg`, a 32px
  `favicon.png` fallback, and a full-bleed 180px `apple-touch-icon.png` (no
  transparent corners so iOS masks it cleanly). Wired into `<head>`, plus a
  Safari `mask-icon`.
- This push was the first to auto-deploy via the new Git connection — confirmed
  it worked (new production deployment appeared and all icons served 200).

---

## Phone DNS troubleshooting (no code change)

**~11:15 — "Not working on my phone"**
- Verified everything was healthy server-side (global DNS, HTTPS, routing).
  Symptom: Safari "cannot find the server."
- Cause: a stale DNS cache on the phone/network (the phone had cached the domain
  as non-existent from before the record was added; both URLs failed once the old
  `loop-six-tau` entry aged out and hit the same jammed resolver).
- Fix: toggling airplane mode flushed the phone's DNS and both URLs worked.
  Explained it was a transient device-side DNS glitch, not a config problem, and
  that the domain-setup cause will not recur; suggested setting the phone's DNS to
  1.1.1.1 if it ever happens again.

---

## Latest feature

**11:20 — Pull-to-refresh (commit d9ee421)**
- The body is fixed, so the browser's native pull-to-refresh never fires. Added a
  custom one: pulling the idle screen down rubber-bands the content, a hint
  switches from "pull to refresh" to "release to refresh" past a threshold, and
  releasing reloads. Scoped to the idle screen only (never mid-walk or while the
  shelf is open); a small dead zone keeps a tap from engaging it; the upward swipe
  still opens the shelf. Auto-deployed via the Git connection.

---

## Current state

- `main` @ d9ee421, in sync with production on Vercel (auto-deploy on push).
- Key is server-side only (`ORS_API_KEY` env var); repo and browser never see it.
- Live at https://loop.charulpassey.com with valid SSL and working `/api` proxy.

### Open / optional follow-ups discussed
- Make `loop.charulpassey.com` the project's primary domain / redirect the
  `.vercel.app` URL — user said this was already handled on Vercel.
- Optional shelf refinement if rows still feel loose: masonry layout, or move the
  date off the grid.
- Optional walking tweaks: snap the dot to the route line; make the map follow
  the dot; lighten the walked-trail colour on the dark map.
- Tunable knobs if needed: bottom-sheet snap thresholds and flick velocity;
  pull-to-refresh threshold and damping.
