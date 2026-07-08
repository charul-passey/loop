# Loop
One button. A walk appears.

Status: v1 spec, ready to build
Format: speculative PRD, portfolio artifact
Author: Charul Passey

---

## The insight

People do not skip walks because they are lazy. They skip walks because a walk requires three decisions before the first step: where to go, how long it will take, and which way to turn at the corner. Each decision is small. Together they are enough friction to keep someone on the couch, because the moment of motivation is shorter than the moment of planning.

Constraint is the product. Loop deletes the decisions. You press one button. The app invents a walking loop from wherever you are standing, sized to the time you have, never the same route twice, and starts. You choose nothing.

## The one metric

Walks started.

Not distance, not steps, not calories, not completions. Starting is the behavior. Everything downstream of the first step takes care of itself. The guardrail metric is time from opening the app to walking: under ten seconds, every time.

## Who this is for

Not "health-conscious urban millennials." One moment: it is 6:40 pm, you have been sitting for nine hours, you have thirty minutes before dinner, and the thought "I should walk" is currently losing to the thought "but where." Loop exists to win that specific fight. It wins it by being faster than the excuse.

## The product

One screen.

A large button that says Walk. Above it, a duration that reads "20 min." Tapping the duration cycles through 15, 20, 30, 45. That is the only control in the entire product, it exists because time is a constraint of the user's life rather than a preference, and the app remembers the last choice so most sessions are literally one tap.

Press Walk. Loop reads your location, generates a closed loop that starts and ends where you stand, draws it on the map, and enters walking mode. Your position is a dot, the route is a line, and the interface gets out of the way. When you arrive back where you began, the walk quietly completes: the shape of your loop is added to your shelf.

The shelf is the delight. Every walk leaves behind its shape, a small abstract line drawing that is a one-of-one, because no route ever repeats. Over weeks the shelf becomes a gallery of places your feet have been, and it is the only history the app keeps. There are no streaks, no missed days, no numbers going up. A shelf can only gain shapes. It cannot shame you.

## What we killed, and why

- Route choice. Showing three route options reintroduces the exact decision the product exists to delete. Loop shows one route. If you dislike it, press Walk again and a different one appears. Regenerating is a tap, not a menu.
- Turn-by-turn voice navigation. This is a walk in your own neighborhood, not a commute. The line on the map is enough, and glancing at a map is part of how a wander feels. Voice guidance would also triple v1 scope.
- Streaks and badges. Guilt is negative retention. A streak converts a missed day into a reason to avoid the app, which converts into churn. The shelf only accumulates.
- Steps, calories, pace. The moment Loop measures the body, it becomes a fitness app and inherits every anxiety fitness apps carry. Loop measures nothing about you.
- Social features. Sharing a shape as an image is allowed because it is generative art. Feeds, friends, and leaderboards are not, for the streak reason above.
- Destination mode ("walk me to the coffee shop"). A different product. Loops only.
- Accounts. There is nothing worth logging into. History lives on the device.

## Mechanics

Route generation. Loop calls a routing engine's round-trip mode with three inputs: current coordinates, target length in meters (minutes times 80, a casual pace), and a random seed. The seed is the novelty engine: a new seed yields a new shape. Loop keeps a local record of past route geometries; if a generated route overlaps a previous one beyond roughly sixty percent, it regenerates with a new seed, up to three attempts, then accepts the best candidate. Perfect novelty is not the promise. Fresh-feeling is.

States. Idle (button plus duration), Generating (a drawing animation while the route resolves, target under four seconds), Walking (map, dot, line, elapsed time in small type), Done (the shape ceremony: the route lifts off the map, renders as a clean line drawing, and slides onto the shelf).

Completion. A walk completes when the user returns within about 75 meters of the start, or ends it manually. An abandoned walk still counts as a walk started, because starting is the metric, and its partial shape joins the shelf slightly faded. Even the quit state refuses to scold.

## Edge cases

- Location permission denied. Ask once for a typed address or landmark as the starting point. No location, no lecture.
- The routing engine cannot close a loop (dead-end streets, cul-de-sac suburbs, waterfronts). Retry with adjusted length and seed. If it still fails, offer an out-and-back honestly: "Today is an out-and-back." Honesty over silence.
- Unwalkable areas. The walking profile of the routing engine prefers footways and paths, but data quality varies. The route is a suggestion, not an instruction, and the copy never implies safety guarantees.
- Signal loss mid-walk. The route is cached on device the moment it is generated. Walking mode works offline.
- Night. The map shifts to a dark style after sunset. Small thing, felt thing.
- Battery. Position polling is throttled. A 45 minute walk should cost single-digit battery.

## Technical approach

Mobile-first web app, single page, installable later as a PWA. MapLibre GL JS for rendering, OpenStreetMap tiles, OpenRouteService directions API in round-trip mode for generation (GraphHopper round-trip as fallback). All history in localStorage. Coordinates leave the device only in the routing API call, and nothing else ever does: no accounts, no analytics identity, no server of our own. Local-first is not an architecture flex here, it is the trust posture a location app owes its user.

## Launch and portfolio plan

Three screenshots for the Featured entry: the idle screen (one teal button on paper), a walking state at dusk, and the shelf holding a dozen shapes. The shelf is the shareable artifact and the organic hook: a grid of walks that look like drawings, posted with "no two are ever the same."

Thinking block, three lines: Insight, constraint is the product. Metric, walks started. Killed, route choice, because options are the disease Loop treats.

## Open questions for v2, not v1

Whether shapes should be exportable as prints. Whether a "surprise me" duration exists. Whether loops can bias toward parks and water when available. All three are cut from v1 because v1 has one job: ten seconds from impulse to first step.
