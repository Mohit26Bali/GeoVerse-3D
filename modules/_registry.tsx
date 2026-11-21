import type { ComponentType } from "react";
import CoordinateSystemsPage from "@/modules/coordinate-systems/CoordinateSystemsPage";
import VectorsPage from "@/modules/vectors/VectorsPage";
import LinesPage from "@/modules/lines/LinesPage";
import PlanesPage from "@/modules/planes/PlanesPage";
import TransformationsPage from "@/modules/transformations/TransformationsPage";
import MatricesPage from "@/modules/matrices/MatricesPage";
import PolyhedraPage from "@/modules/polyhedra/PolyhedraPage";
import SphereGeometryPage from "@/modules/sphere-geometry/SphereGeometryPage";
import ConicSectionsPage from "@/modules/conic-sections/ConicSectionsPage";
import BezierCurvesPage from "@/modules/bezier-curves/BezierCurvesPage";
import SplinesPage from "@/modules/splines/SplinesPage";
import ComputationalGeometryPage from "@/modules/computational-geometry/ComputationalGeometryPage";
import LinearAlgebraPlaygroundPage from "@/modules/linear-algebra-playground/LinearAlgebraPlaygroundPage";
import RealWorldApplicationsPage from "@/modules/real-world-applications/RealWorldApplicationsPage";
import GeometryLabPage from "@/modules/geometry-lab/GeometryLabPage";

/**
 * Maps a module slug to its real implementation. Slugs absent here fall
 * back to ModulePlaceholder — add an entry as each module ships.
 */
export const MODULE_COMPONENTS: Record<string, ComponentType> = {
  "coordinate-systems": CoordinateSystemsPage,
  vectors: VectorsPage,
  lines: LinesPage,
  planes: PlanesPage,
  transformations: TransformationsPage,
  matrices: MatricesPage,
  polyhedra: PolyhedraPage,
  "sphere-geometry": SphereGeometryPage,
  "conic-sections": ConicSectionsPage,
  "bezier-curves": BezierCurvesPage,
  splines: SplinesPage,
  "computational-geometry": ComputationalGeometryPage,
  "linear-algebra-playground": LinearAlgebraPlaygroundPage,
  "real-world-applications": RealWorldApplicationsPage,
  "geometry-lab": GeometryLabPage,
};
