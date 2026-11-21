export type SceneId = "robotics" | "physics" | "graphics";

export const SCENES: { id: SceneId; label: string; description: string }[] = [
  {
    id: "robotics",
    label: "Robotics",
    description:
      "A 2-link robot arm solves inverse kinematics to reach a dragged target — the same composed rotation matrices from Transformations & Matrices, chained.",
  },
  {
    id: "physics",
    label: "Physics",
    description:
      "Projectile motion traces a parabola; orbital motion traces an ellipse, parabola, or hyperbola depending on energy — the exact same curve family from Conic Sections.",
  },
  {
    id: "graphics",
    label: "Graphics",
    description:
      "Click the sphere to cast a ray and sample a point; drag the light to see Lambertian shading — the dot product between the surface normal and the light direction, live.",
  },
];
