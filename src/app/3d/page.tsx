import ProductViewer3D from "@/components/ProductViewer3D";

export const metadata = {
  title: "Studio Object — Mine AI",
  description: "A lightweight interactive 3D material configurator.",
};

export default function ProductViewerPage() {
  return (
    <main className="viewer3d-page">
      <div className="viewer3d-intro">
        <p className="viewer3d-kicker">FE-AA2 / MATERIAL STUDY</p>
        <h1>Studio Object</h1>
        <p>Shape, light, and surface in one small interactive scene.</p>
      </div>
      <ProductViewer3D />
      <p className="viewer3d-hint">Drag to orbit · Scroll or pinch to zoom · Open the panel to tune the finish</p>
    </main>
  );
}
