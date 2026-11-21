import {
  Axis3d,
  ArrowRight,
  Spline,
  Layers,
  Move3d,
  Grid3x3,
  Box,
  Circle,
  Cone,
  Waypoints,
  GitBranch,
  Network,
  Sigma,
  Globe2,
  FlaskConical,
} from "lucide-react";
import type { ModuleSummary } from "@/types/module";

/**
 * Registry of every planned module. `status` controls whether the module
 * route renders its real scene or a "coming soon" placeholder — this lets
 * the shell, nav, and routing exist for the whole platform from day one
 * while content ships incrementally.
 */
export const MODULES: ModuleSummary[] = [
  {
    slug: "coordinate-systems",
    title: "Coordinate Systems",
    shortDescription: "Origins, axes, planes, distances, and translations.",
    category: "coordinate-systems",
    icon: Axis3d,
    accent: "primary",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "The 3D coordinate system: an origin at (0, 0, 0) and three mutually perpendicular axes (X, Y, Z) that let you pinpoint any location in space with three numbers.",
      why: "Every other module in GeoVerse — vectors, lines, planes, transformations — is built on top of this. Reading coordinates fluently is the prerequisite for everything else.",
      how: "A point's coordinates are its signed distances along each axis. Distance between two points comes from the 3D Pythagorean theorem; a midpoint averages each coordinate independently.",
      usage:
        'Explore: drag the point and watch its coordinates and distance from the origin update live. Guided: a 5-step walkthrough from the origin to midpoints — pause any step and click "Explain with AI" for a grounded explanation of that exact moment. Practice: drag to match a target coordinate. Challenge: five timed rounds.',
    },
  },
  {
    slug: "vectors",
    title: "Vectors",
    shortDescription: "Magnitude, direction, dot & cross products, projections.",
    category: "vectors",
    icon: ArrowRight,
    accent: "secondary",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A vector is an arrow from an origin with both a magnitude (length) and a direction — used to represent displacement, force, velocity, or any quantity that has both.",
      why: "Vectors are the working language of 3D graphics, physics, and machine learning: every rotation, force, camera direction, and gradient is a vector. The dot and cross products in particular power lighting, collision detection, and torque calculations.",
      how: "Magnitude comes from the Pythagorean theorem. The dot product measures how aligned two vectors are (and gives the angle between them). The cross product produces a new vector perpendicular to both, with length equal to the area of the parallelogram they span. Projection decomposes one vector into a component parallel to another.",
      usage:
        "Explore: drag the tips of vectors A and B, then switch between Add / Subtract / Scale / Dot / Project / Cross to see each operation live. Guided: a step-by-step walkthrough of every operation. Practice: construct a vector matching a target. Challenge: five timed rounds.",
    },
  },
  {
    slug: "lines",
    title: "Lines",
    shortDescription: "Parametric equations, closest points, intersections.",
    category: "lines",
    icon: Spline,
    accent: "accent",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "An infinite line in 3D, defined by a point it passes through and a direction vector — written parametrically as (x, y, z) = P₀ + t·d, where t ranges over all real numbers.",
      why: "Lines model rays, edges, camera sightlines, and robot-arm segments. Finding the closest point on a line to a target — and the shortest distance between two lines that don't touch — are core operations in graphics (ray casting), robotics, and CAD.",
      how: "The closest point on a line to an external point comes from projecting the offset onto the direction vector. Two lines in 3D are usually skew — they don't intersect — so instead we solve for the shortest segment connecting them, which is perpendicular to both directions at once.",
      usage:
        "Explore: drag a line's point and direction, plus an external point, to see the closest point and distance live — or switch to Line-Line mode to see two skew lines' closest approach. Guided: 6 steps from parametric equations to closest approach. Practice: drag a marker onto the closest point on a line. Challenge: five timed rounds.",
    },
  },
  {
    slug: "planes",
    title: "Planes",
    shortDescription: "Normal vectors, plane equations, intersections.",
    category: "planes",
    icon: Layers,
    accent: "primary",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A flat, infinite 2D surface in 3D space, defined by a point it passes through and a normal vector perpendicular to it — written as ax + by + cz = d, where (a, b, c) is the normal.",
      why: "Planes model walls, floors, cutting surfaces, and camera near/far clipping in graphics; the normal vector is exactly what lighting calculations use to determine how a surface reflects light. Line-plane and plane-plane intersections power ray casting, CAD boolean operations, and collision detection.",
      how: "Three non-collinear points determine a unique plane via the cross product of two edge vectors. Distance from a point to a plane projects the offset onto the normal. A line pierces a plane where its parametric equation satisfies the plane's equation. Two non-parallel planes always meet in a line — solved from both plane equations at once.",
      usage:
        "Explore: switch between Distance, Three Points, Line-Plane, and Plane-Plane to see each relationship live. Guided: 6 steps from the plane equation to both intersection types. Practice: drag a marker onto the closest point on a plane. Challenge: five timed rounds.",
    },
  },
  {
    slug: "transformations",
    title: "Transformations",
    shortDescription: "Translate, scale, rotate, reflect, shear.",
    category: "transformations",
    icon: Move3d,
    accent: "secondary",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A transformation moves, resizes, rotates, mirrors, or skews every point of a shape at once — translation, scaling, rotation, reflection, and shear are the five basic types, each expressible as a single matrix.",
      why: 'Every object in a 3D scene, every bone in a character rig, every CAD part placement is a transformation matrix. Understanding that translate/scale/rotate/reflect/shear are all "just a matrix" — and that the order you apply them in matters — is the foundation of 3D graphics and robotics.',
      how: "Scaling, rotation, reflection, and shear are linear maps (a 3x3 matrix multiplying the point). Translation isn't linear on its own, so it's folded in using a 4x4 \"homogeneous\" matrix with an extra coordinate fixed at 1 — letting every transform, including translation, compose by simple matrix multiplication.",
      usage:
        "Explore: pick an operation and drag/adjust its control to see the matrix and the transformed shape update live, next to a ghost of the original. Guided: 7 steps ending in homogeneous coordinates. Practice: match a target pose via translation or rotation. Challenge: five timed rounds mixing both.",
    },
  },
  {
    slug: "matrices",
    title: "Matrices",
    shortDescription: "Rotation, scaling, reflection, composition, inverses.",
    category: "matrices",
    icon: Grid3x3,
    accent: "accent",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A matrix is fully described by where it sends the basis vectors î, ĵ, k̂ — its columns are exactly their landing positions. Everything else (the transformed grid, the unit cube, the determinant) follows from just those three vectors.",
      why: "This is the single most useful mental model in linear algebra: instead of memorizing matrix arithmetic rules, you can read off what any matrix does geometrically just by looking at its columns. It's how 3D engines, robotics, and machine learning all think about linear maps internally.",
      how: "The determinant is the signed volume of the parallelepiped the basis vectors span — its sign flips when the transformation mirrors space. The inverse is the matrix that sends those landing positions back to î, ĵ, k̂. Composing two matrices means applying one basis-vector-mapping, then the other — and order changes the result.",
      usage:
        'Explore: drag î, ĵ, k̂ directly, or load a preset, and watch the parallelepiped, the warped grid, and the determinant update live. Guided: 8 steps from "a matrix is its basis vectors" to composition order. Practice: drag all three vectors to match a target matrix. Challenge: five timed rounds.',
    },
  },
  {
    slug: "polyhedra",
    title: "Polyhedra",
    shortDescription: "Platonic solids, exploded views, unfolding nets.",
    category: "polyhedra",
    icon: Box,
    accent: "primary",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A polyhedron is a solid bounded entirely by flat polygonal faces. The five Platonic solids — tetrahedron, cube, octahedron, dodecahedron, icosahedron — are the only ones where every face is the same regular polygon and every vertex looks identical; a prism and pyramid are shown alongside them as familiar non-Platonic examples.",
      why: "Polyhedra show up everywhere from crystal structures to 3D game assets to dice. Euler's formula (vertices minus edges plus faces always equals 2, for any convex polyhedron) is one of the most quietly powerful results in geometry, and seeing faces separate in an exploded view builds real intuition for how a solid is put together.",
      how: "Every solid here is built from one shared mechanism: its triangles are grouped into logical flat faces by matching normals, then each face's vertices are pushed outward along that face's own normal to create the exploded view. Click any face to select and inspect it.",
      usage:
        "Explore: pick a solid, drag the explode slider, click faces to highlight them. Guided: 7 steps covering Platonic solids, Euler's formula, exploded views, and face structure. Practice: identify a solid from its vertex/edge/face counts. Challenge: five timed rounds.",
    },
  },
  {
    slug: "sphere-geometry",
    title: "Sphere Geometry",
    shortDescription: "Radius, chords, great circles, surface area & volume.",
    category: "spheres",
    icon: Circle,
    accent: "secondary",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A sphere is the set of all points a fixed distance (the radius) from a center point. Chords connect two points on its surface, great circles are the largest possible circles that fit on it, and slicing it with a plane always produces a circular cross-section.",
      why: "Spheres model planets, ball bearings, lenses, and bounding volumes in 3D graphics. Cross-sections in particular are how CT/MRI scanners reconstruct 3D shapes from 2D slices, and the spherical cap volume formula is exactly what governs how much liquid sits in a rounded tank at a given fill level.",
      how: "Surface area and volume follow directly from the radius. A cross-section's radius shrinks according to the Pythagorean theorem as the slicing plane moves away from center. A great circle is the special case of a cross-section that passes through the exact center.",
      usage:
        "Explore: drag the radius handle, then switch between Chord & Great Circle, Cross Section, and Water Fill to see each relationship live. Guided: 7 steps from radius to spherical caps. Practice: match a target cross-section radius, or a target volume/surface area. Challenge: five timed rounds mixing both.",
    },
  },
  {
    slug: "conic-sections",
    title: "Conic Sections",
    shortDescription: "Slicing a cone into circles, ellipses, parabolas, hyperbolas.",
    category: "conics",
    icon: Cone,
    accent: "accent",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A conic section is the curve formed where a flat plane slices through a double cone. Depending on the plane's tilt relative to the cone's own slant, that curve is a circle, an ellipse, a parabola, or a hyperbola — the four are really one continuous family, not four unrelated shapes.",
      why: "Conic sections describe planetary orbits (ellipses), the path of a thrown ball (parabola), the shape of a telescope mirror or satellite dish (parabola again), and the paths used in some navigation systems (hyperbola). Which curve you get is decided by a single quantity: the discriminant of the intersection equation.",
      how: "Substituting the plane's own 2D coordinates into the cone's equation produces a quadratic in those coordinates, exactly like the equation of a 2D conic. Its discriminant, B² minus 4AC, tells you the type: negative means an ellipse (or circle, the special case where it's perfectly round), zero is the knife-edge parabola case, and positive is a hyperbola with two separate branches.",
      usage:
        "Explore: drag the tilt and offset sliders (or tap a preset) to slice the cone and watch the curve — and its classification — update live. Guided: 6 steps from the double cone itself through all four curve types to the discriminant that ties them together. Practice: dial in a tilt that produces a named target curve. Challenge: five timed rounds.",
    },
  },
  {
    slug: "bezier-curves",
    title: "Bézier Curves",
    shortDescription: "Draggable control points, tangents, and handles.",
    category: "bezier",
    icon: Waypoints,
    accent: "primary",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A Bézier curve is built from a small set of control points that never sit on the curve itself (except the first and last) — instead they pull and shape it, like handles. Linear uses 2 points, quadratic 3, cubic 4, and the curve is defined by repeatedly interpolating between them.",
      why: "Bézier curves are the backbone of vector graphics, font outlines, CSS/animation easing curves, and CAD surface modeling — anywhere a smooth, precisely controllable curve is needed. Understanding the de Casteljau construction is understanding exactly how software like Illustrator or Figma draws a curve when you drag a handle.",
      how: "At any parameter t, de Casteljau's algorithm linearly interpolates each consecutive pair of control points by t, then interpolates between those results, repeating until a single point remains — that point traces the curve as t sweeps from 0 to 1. The tangent direction at any point comes from the same construction one level up.",
      usage:
        "Explore: pick a degree, drag the control points, and scrub the t slider to watch the nested interpolation lines converge to the point on the curve. Guided: 5 steps from linear through cubic to tangents. Practice: drag your control points to match a target curve. Challenge: five timed rounds mixing quadratic and cubic.",
    },
  },
  {
    slug: "splines",
    title: "Splines",
    shortDescription: "Catmull-Rom, Bézier splines, and B-splines.",
    category: "splines",
    icon: GitBranch,
    accent: "secondary",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A spline threads a smooth curve through — or near — a whole sequence of points, not just two or four. Catmull-Rom and Bézier splines pass exactly through every anchor point; a B-spline instead approximates them, staying close but not touching.",
      why: "A single Bézier curve only has 2-4 control points and one segment; real paths — camera rails in games, animation motion paths, road and terrain modeling — need many points chained together smoothly. B-splines in particular are the backbone of professional CAD/NURBS surface modeling, because moving one control point only reshapes a local neighborhood instead of the whole curve.",
      how: "Catmull-Rom and B-splines are both \"windowed cubic\" curves — every point on the curve depends only on the 4 nearest anchors, blended by a fixed basis matrix. The two matrices differ in exactly one way: Catmull-Rom's is built so the curve passes through the middle two anchors of each window; the B-spline's blends all four without forcing that. A Bézier spline instead chains full cubic Bézier segments together, with each joint's handles aligned to keep the curve smooth.",
      usage:
        "Explore: drag the anchor points and switch between Catmull-Rom, Bézier Spline, and B-Spline to see the same points produce different curves. Guided: 5 steps from why splines exist through to B-spline locality. Practice: match a target curve by dragging anchors. Challenge: five timed rounds mixing all three spline types.",
    },
  },
  {
    slug: "computational-geometry",
    title: "Computational Geometry",
    shortDescription: "Convex hulls, Voronoi diagrams, Delaunay triangulation.",
    category: "computational-geometry",
    icon: Network,
    accent: "accent",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "Computational geometry is the study of algorithms for shapes and point sets: the convex hull wrapping a set of points, Voronoi diagrams partitioning space by nearest neighbor, Delaunay triangulations connecting points without slivers, bounding boxes, ray casting, and collision detection.",
      why: "These six ideas are the quiet infrastructure behind graphics, games, GIS, and robotics — mouse picking is ray casting, physics engines start every collision check with a bounding box, map apps use Voronoi diagrams to find your nearest branch, and mesh generation relies on Delaunay triangulation to avoid degenerate triangles.",
      how: "Convex hull uses a monotone chain sweep; Voronoi cells come from clipping a region by the perpendicular bisector of every pair of sites; Delaunay triangulation incrementally re-triangulates around each new point so no point ever lands inside another triangle's circumcircle (Bowyer-Watson); bounding boxes are just coordinate min/max; ray casting solves for where a ray's parametric line crosses a shape's edges; collision detection ranges from a simple distance check (circles) to the separating axis theorem (convex polygons).",
      usage:
        "Explore: switch between all six topics and drag their points/sites/shapes to see each construction update live. Guided: 6 steps, one per topic. Practice: a Yes/No predict-then-reveal quiz mixing all six topics, untimed. Challenge: 8 timed rounds of the same quiz.",
    },
  },
  {
    slug: "linear-algebra-playground",
    title: "Linear Algebra Playground",
    shortDescription: "Eigenvectors, span, rank, null space, live transformations.",
    category: "linear-algebra",
    icon: Sigma,
    accent: "primary",
    status: "available",
    modes: ["explore", "guided", "practice", "challenge", "summary"],
    help: {
      whatIsIt:
        "A 2x2 matrix, viewed through five lenses at once: its span (everywhere its two columns can reach), its column space (the same thing, framed as 'what can this matrix output'), its rank (the dimension of that reach), its null space (everything it crushes to the origin), and its eigenvectors — the special directions it only stretches, never rotates.",
      why: "These five ideas are the conceptual core of linear algebra, and they're all facts about the exact same object. Rank and null space determine whether a system of equations has a unique solution; eigenvectors are what PCA, Google's PageRank, and vibration analysis are actually computing; span and column space are the language every other linear-algebra result is phrased in.",
      how: "Dragging î and ĵ directly edits the matrix, since they are its columns. Rank comes from whether the columns stay linearly independent (determinant away from zero) or collapse. The null space is whatever direction survives being multiplied by a collapsed (singular) matrix and still lands on zero. An eigenvector v satisfies Mv = λv exactly — solved here in closed form from the matrix's trace and determinant.",
      usage:
        "Explore: switch between the four tabs and drag î/ĵ (plus a probe vector on the Eigen and Null Space tabs) to see each concept update live on the same transformation. Guided: 5 steps from span through eigenvectors. Practice: drag-to-construct rounds — make a vector an eigenvector, hit a target rank, land a vector in the null space, or align a vector's span with a target. Challenge: 6 timed rounds mixing all four.",
    },
  },
  {
    slug: "real-world-applications",
    title: "Real-World Applications",
    shortDescription: "Robotics, CAD, graphics, and physics in action.",
    category: "applications",
    icon: Globe2,
    accent: "secondary",
    status: "available",
    modes: ["explore"],
    help: {
      whatIsIt:
        "Three interactive vignettes showing earlier modules' math doing real work: a 2-link robot arm solving inverse kinematics, projectile and orbital motion (parabolas and ellipses as physics), and Lambertian lighting with ray-cast picking.",
      why: "It's easy to learn dot products, matrices, or conic sections as abstract exercises and never see where they actually show up. This module closes that loop: the same composed rotation matrices from Transformations drive a robot arm, the same conic classification from Conic Sections determines whether a spacecraft escapes orbit, and the same ray casting from Computational Geometry is what a mouse click uses to hit a 3D object.",
      how: "The robot arm solves the law of cosines for its elbow angle, then applies it as a composed homogeneous rotation matrix. Projectile motion uses the standard kinematic equations; orbital motion integrates Newtonian gravity step by step and classifies the result by specific orbital energy — negative is an ellipse, zero a parabola, positive a hyperbola. The lighting demo computes brightness as the dot product between a surface normal and the direction to the light, at whatever point your click's ray hits.",
      usage:
        "Explore only: switch between Robotics, Physics, and Graphics. Drag the target/launch vector/velocity handle/light in each scene to see the underlying math respond live.",
    },
  },
  {
    slug: "geometry-lab",
    title: "Geometry Lab",
    shortDescription:
      "A construction workspace: place, transform, and combine objects freely.",
    category: "geometry-lab",
    icon: FlaskConical,
    accent: "accent",
    status: "available",
    modes: ["explore"],
    help: {
      whatIsIt:
        "An open construction workspace, not a lesson: place points, vectors, lines, planes, spheres, and cubes freely, then select any two (or three) of them to run an operation — cross product, plane-plane intersection, plane-sphere cross-section, and more — using the exact math every other module teaches.",
      why: "Every other module says 'here is a concept, interact with it.' Geometry Lab says 'build whatever you want with what you've learned' — the difference between following a lesson and constructing something yourself, which is where understanding actually sticks.",
      how: "Each operation reuses the same functions the rest of GeoVerse is built on: vector add/subtract/dot/cross/angle/projection, plane-plane and plane-sphere intersection, distance and closest-point queries. Running one adds the result as a new object in the scene and shows the formula with your own numbers substituted in.",
      usage:
        "Pick a tool and click in the scene to place an object. Switch to Select to drag its handles, edit its properties, or shift-click a second (or third) object to see available operations. Undo/redo and named local saves are available from the toolbar.",
    },
  },
];
