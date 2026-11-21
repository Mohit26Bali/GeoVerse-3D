# GeoVerse

An interactive 3D geometry and linear algebra learning platform. Every
interaction is meant to teach a mathematical concept through direct
manipulation, not just visualize it.

Fifteen modules are built and available, from Coordinate Systems through
Real-World Applications, each with Explore / Guided / Practice / Challenge /
Summary modes. The newest is **Geometry Lab**, a construction workspace:
place points, vectors, lines, rays, segments, planes, spheres, and cubes
freely, then combine any two (or three) of them to run an operation, using
the same math the other modules teach.

The look is called **Observatory**: a star chart at night, with midnight blue,
thin brass linework, an ivory serif for titles and IBM Plex for the interface.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · React Three Fiber · Drei ·
`@react-three/postprocessing` · Three.js · mathjs · Zustand · Tailwind CSS 4 ·
KaTeX · Framer Motion · GSAP · React Spring · Lucide Icons

## Getting started

Requires Node.js 20.9 or newer and [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env.local   # optional: only the AI explanation needs a key
pnpm dev                     # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm format`, `pnpm tsc --noEmit`.

### Environment variables

Everything works without any configuration. The optional **Explain with AI**
button (in Guided mode) calls [Groq](https://console.groq.com/keys) from a
server route, so the key never reaches the browser.

| Variable                 | Required          | Purpose                                                                                                                 |
| ------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `GROQ_API_KEY`           | for the AI button | Groq key, read only on the server. Without it the button says it is not set up.                                         |
| `GROQ_MODEL`             | no                | Override the model (default `openai/gpt-oss-120b`).                                                                     |
| `EXPLAIN_RATE_PER_MIN`   | no                | Requests per visitor per minute (default 6).                                                                            |
| `EXPLAIN_GLOBAL_PER_MIN` | no                | Requests for the whole site per minute (default 60).                                                                    |
| `TRUSTED_PROXY_HOPS`     | no                | Number of reverse proxies in front of the app (Vercel: `1`), so each visitor gets their own limit. Leave unset locally. |
| `ALLOWED_ORIGIN`         | no                | The site's public address, if it is served from more than one host.                                                     |

## Hero video

`components/layout/HeroVideo.tsx` cycles the three brand cinematics in
`public/videos/` (vid1/2/3.mp4 + matching `-poster.jpg` stills), crossfading
at each cut so the loop reads as one reel. The footage is tinted slightly
warm so it sits inside the palette. There is a pause button, and the page
shows a still poster instead of the video under `prefers-reduced-motion`.
Swap or reorder clips by editing the `CLIPS` array in that file; poster
stills were extracted with `ffmpeg -ss 5 -frames:v 1`.

## Architecture

Every teaching module follows the same pipeline:

```text
Scene → Objects → Animations → Mathematical Engine → Explanation Layer → Interactive Controls → Challenge Mode
```

```text
app/                      Next.js App Router routes (thin: compose modules + layout)
  modules/[slug]/         Dynamic module route — every module, including Geometry Lab, lives here

components/
  ui/                     Design-system primitives (Button, Panel, Badge, Equation/KaTeX)
  layout/                 TopBar, ModuleSidebar (collapsible), ModuleGrid
  panels/                 ModeSwitcher, ControlPanel, StatReadout — shared HUD widgets

three/
  engine/                 Scene (Canvas host), ModuleScene (standard composition), GridFloor, Axes
  camera/                 CameraRig (damped OrbitControls), useCameraFocus (cinematic GSAP framing)
  lights/                 LightingRig (ambient + key + rim + HDRI environment)
  postprocessing/         Effects (Bloom, SMAA, Vignette, optional DOF)
  objects/                Reusable primitives: PointObject, VectorArrow, LineObject, PlaneObject, FilledPolygon

modules/
  <slug>/                 One folder per module: types.ts, steps.ts, ExploreView/GuidedView/
                           PracticeView/ChallengeView/SummaryView.tsx, <Name>Page.tsx
  geometry-lab/            The construction workspace — see below
  foundation-demo/        Reference implementation exercising the full stack end-to-end
  _shared/                ModulePlaceholder — renders for any not-yet-built module

math/                     Pure functions: vector.ts, matrix.ts, geometry.ts, physics.ts,
                           linearAlgebra2x2.ts, computationalGeometry.ts, format.ts (→ LaTeX)
animations/               useGsapTimeline, useCountUp, useQuaternionTween, useProgressiveDraw
store/                    Zustand: useAppStore (nav/mode/sidebar, persisted), useSceneStore
                           (Geometry Lab's scene graph — objects, selection, undo/redo history)
constants/                theme.ts (palette), scene.ts (defaults), modules.ts (module registry)
types/                    math.ts, module.ts — shared across the whole app
```

**Adding a module** means: define its slug/metadata in `constants/modules.ts`,
build its scene under `modules/<slug>/` by composing `ModuleScene` +
`three/objects/*` + `math/*`, and swap its `status` to `"available"`. The
engine, camera, lighting, grid, postprocessing, mode switcher, and control
panel shell are already provided — new modules only author the
module-specific objects, math, and explanation content.

### Design principles enforced by the engine

- **Nothing snaps.** Camera moves use `useCameraFocus` (GSAP, position +
  orbit target tweened together); rotations use per-frame quaternion slerp
  (`useQuaternionTween`); numeric readouts count smoothly
  (`useCountUp` via react-spring); lines/vectors draw in progressively
  (`useProgressiveDraw`); equations cross-fade instead of replacing
  (`Equation`).
- **Objects never float.** Every `ModuleScene` includes a grid, ground
  plane, and coordinate axes by default.
- **One math source of truth.** `math/vector.ts` and `math/geometry.ts` wrap
  `THREE.Vector3` behind plain `[x, y, z]` tuples so modules never need to
  import `three` just to do arithmetic; `math/matrix.ts` (mathjs) handles
  general NxN operations (determinant, inverse, eigendecomposition, rank).
  Geometry Lab's entire Operations panel is this principle taken furthest:
  every operation reuses a function that some other module already teaches.
- **One visual language.** Colors live in `constants/theme.ts` (mirrored in
  `app/globals.css`), so Tailwind classes and Three.js material colors never
  drift apart.

## Modules

Coordinate Systems, Vectors, Lines, Planes, Transformations, Matrices,
Polyhedra, Sphere Geometry, Conic Sections, Bézier Curves, Splines,
Computational Geometry, Linear Algebra Playground, Real-World Applications,
and Geometry Lab — all `"available"` in `constants/modules.ts`, each with
Explore / Guided / Practice / Challenge / Summary modes (Real-World
Applications and Geometry Lab are Explore-only by design — the former is a
set of vignettes, the latter a construction tool, neither maps naturally
onto "guided lesson / timed quiz"). A platform-wide Challenge Mode was
planned but deliberately dropped — every module already has its own
Challenge mode, and a cross-module version would add achievement tracking
with no persistence behind it, for little real teaching value.

## Geometry Lab

A construction workspace, not a lesson: an empty scene, a tool palette, and
an object list. Reused render components (`PointObject`, `VectorArrow`,
`LineObject`, `PlaneObject`) mean every object type gets dragging, snapping,
and selection for free.

**Objects**: point, vector, line, ray, segment, plane, sphere, cube. Placed
by clicking in the scene (1 click for a point, 2 for most others, 3 for a
plane) or typed directly via the **Equation Editor** — `x + y + z = 5`,
`(x-2)^2 + (y-1)^2 + z^2 = 9`, `(1,2,3) + t(4,5,6)`, `<3,5,1>` all parse into
the matching object (plane parsing is genuinely general for any linear
expression; the others match a fixed template — see
`modules/geometry-lab/equationParser.ts`).

**Operations panel**: select two objects (or three points, or one segment)
and run whatever's defined for that combination. The full matrix, across
point / vector / line / ray / segment / plane / sphere:

| —           | point              | vector                                       | line                    | ray                     | segment                 | plane                                | sphere                    |
| ----------- | ------------------ | -------------------------------------------- | ----------------------- | ----------------------- | ----------------------- | ------------------------------------ | ------------------------- |
| **point**   | midpoint, distance | —                                            | distance, closest point | distance, closest point | distance, closest point | distance, closest point              | distance to surface       |
| **vector**  |                    | add, subtract, cross, dot, angle, projection | angle                   | angle                   | angle                   | angle (to the plane, not its normal) | —                         |
| **line**    |                    |                                              | angle, closest approach | angle, closest approach | angle, closest approach | intersection                         | —                         |
| **ray**     |                    |                                              |                         | angle, closest approach | closest approach        | intersection                         | intersection              |
| **segment** |                    |                                              |                         |                         | angle, closest approach | intersection                         | intersection              |
| **plane**   |                    |                                              |                         |                         |                         | intersection                         | cross-section             |
| **sphere**  |                    |                                              |                         |                         |                         |                                      | distance between surfaces |

Three selected points get **Create Plane**; a single selected segment gets
**Length**. Cube deliberately participates in none of this — a solid volume
doesn't have the same clean pairwise-operation semantics as the others, so
it's placement/transform only.

Every "distance"/"angle"/"intersection" reuses a function from `math/geometry.ts`
or `math/vector.ts`; the only new solver is `closestApproachBounded`: one exact
algorithm for closest-approach between any two of {line, ray, segment},
parameterized by each side's allowed range (`(-∞,∞)`, `[0,∞)`, `[0,1]`),
rather than a bespoke formula per pairing. It checks the unconstrained
optimum and every boundary case, so the answer stays exact even for nearly
parallel lines.

**Also included**: undo/redo (snapshot history), named local saves
(`localStorage`, via `modules/geometry-lab/persistence.ts`), and grid/vertex/
origin snapping.

**Deliberately not built**: a Polygon tool (needs a variable-length
placement flow — every other tool commits after a fixed number of clicks),
an animation timeline/keyframes, and GLTF/SVG/share-link export (the last
needs a backend this project doesn't have).

## Security and privacy

- **The AI route is limited.** `/api/explain` accepts only a short step description for a real GeoVerse module, rejects anything oversized, checks the request comes from the site, limits each visitor and the whole site per minute, caps the model's output, and never sends the provider's error text to the browser.
- **Typed equations are restricted.** The Geometry Lab equation box accepts only numbers, brackets, `+ - * / ^` and a short list of maths functions, at most 200 characters, and refuses results that are not finite or are huge.
- **Saved scenes are checked** when they are read back from the browser, so a damaged or hand-edited entry is ignored instead of breaking the page.
- **Nothing is loaded from other sites.** Fonts are bundled at build time, the 3D reflections are generated in the browser, and the axis labels use a bundled font file, so a visit makes no request to any third party.
- **Headers:** Content-Security-Policy, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy, and HSTS in production. `X-Powered-By` is removed.
- **Dependencies:** `pnpm audit` reports no known vulnerabilities.

## Quality notes

The maths is checked by automated tests against independent formulas and identities: cross-product identities, the Bernstein form for Bézier curves, brute-force searches for closest approach and convex hulls, the empty-circle property for Delaunay triangulation, and answer checks for every generated quiz question. That testing found and fixed three real bugs in the maths:

- the closest-approach solver was not exact for nearly parallel lines;
- the Delaunay triangulation could miss a sliver of the convex hull;
- the Eigenvector challenge could generate a matrix where every vector counted as a solution.

## Known limitations

- **The tests are not in this repository.** They run locally; adding them to CI is on the improvement list.
- **The AI explanation is optional and needs your own Groq key.** Answers come from a language model, so they can occasionally be wrong. They are limited to 2-4 sentences about the step on screen.
- **Rate limits are kept in memory.** They reset when the server restarts and are not shared between several servers.
- **Phones:** the 3D scenes work on a phone, but the module list sidebar is hidden on small screens (use **Modules** in the top bar), and dragging small handles with a finger is less precise than with a mouse.
- **Performance:** scenes use shadows, bloom and anti-aliasing. On a weak graphics card they can run slowly. There is no quality setting yet.
- **Maths scope:** typed values are limited to ±1,000,000. The Linear Algebra Playground works on 2x2 matrices only; Matrices and Transformations handle 3x3 and 4x4.
- **The Content-Security-Policy allows inline scripts and styles**, because Next.js needs them to start up.
- **No accounts or sync.** Saved Geometry Lab scenes live only in the browser they were saved in.

## Possible improvements

**High priority**

- Run the test suite in CI on every push.
- A graphics-quality setting (shadows, bloom, anti-aliasing) and an automatic low-power mode.
- A module list on phones (a menu button in the top bar).

**Medium priority**

- Keyboard controls for moving points in the 3D scenes.
- Progress tracking per module (what you have completed) and shareable Geometry Lab scenes.
- A text description of what is on screen for screen-reader users in each module.

**Low priority**

- More Challenge question types, and a nonce-based Content-Security-Policy.

## Credits

Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces), [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) and [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono), all under the SIL Open Font License. The axis labels use a bundled copy of IBM Plex Mono in `public/fonts`.

## Deployment

Deploys to Vercel with no extra configuration (`vercel.json` not required —
standard Next.js App Router build).

On the host, set `TRUSTED_PROXY_HOPS=1` (so each visitor gets their own rate
limit) and, only if you want the AI button, `GROQ_API_KEY`. No database is
needed. The hero videos in `public/videos` are about 9 MB in total.
