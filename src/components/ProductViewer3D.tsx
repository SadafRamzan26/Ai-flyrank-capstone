"use client";

import dynamic from "next/dynamic";

const ProductViewerCanvas = dynamic(() => import("@/components/ProductViewerCanvas"), {
  ssr: false,
  loading: () => (
    <div className="viewer3d-skeleton" role="status" aria-label="Loading 3D product viewer">
      <div className="viewer3d-skeleton__object" />
      <span>Preparing the studio</span>
    </div>
  ),
});

export default function ProductViewer3D() {
  return (
    <section className="viewer3d-shell" aria-label="Interactive 3D product viewer">
      <ProductViewerCanvas />
    </section>
  );
}
