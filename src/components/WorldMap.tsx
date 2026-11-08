import { useMemo, useRef, useState, type ReactNode } from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import world from "../data/world-110m.json";

type Props = { iso3: string | null; name: string };
const topo = world as unknown as Topology<{ countries: GeometryCollection<Props> }>;
const shapes = (feature(topo, topo.objects.countries) as unknown as { features: Feature<Geometry, Props>[] }).features.filter(
  (f) => f.properties.name !== "Antarctica",
);

const W = 960;
const H = 470;
const projection = geoEqualEarth().fitExtent(
  [
    [4, 4],
    [W - 4, H - 4],
  ],
  { type: "FeatureCollection", features: shapes },
);
const path = geoPath(projection);

export function WorldMap({
  fill,
  tooltip,
  onSelect,
  label,
}: {
  fill: (iso3: string | null) => string;
  tooltip: (iso3: string | null, name: string) => ReactNode;
  onSelect?: (iso3: string) => void;
  label: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ f: Feature<Geometry, Props>; x: number; y: number } | null>(null);
  const ds = useMemo(() => shapes.map((f) => ({ f, d: path(f) ?? "" })), []);

  const move = (e: React.PointerEvent, f: Feature<Geometry, Props>) => {
    const r = wrap.current!.getBoundingClientRect();
    const x = e.clientX - r.left;
    setHover({ f, x: Math.min(x + 14, r.width - 270), y: e.clientY - r.top + 14 });
  };

  return (
    <div className="map-wrap map" ref={wrap} onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <path className="sphere" d={path({ type: "Sphere" }) ?? ""} />
        {ds.map(({ f, d }) => (
          <path
            key={f.properties.name}
            className={`country${hover?.f === f ? " on" : ""}`}
            d={d}
            fill={fill(f.properties.iso3)}
            onPointerMove={(e) => move(e, f)}
            onClick={() => f.properties.iso3 && onSelect?.(f.properties.iso3)}
          >
            <title>{f.properties.name}</title>
          </path>
        ))}
      </svg>
      {hover && (
        <div className="tooltip" style={{ left: Math.max(0, hover.x), top: hover.y }}>
          {tooltip(hover.f.properties.iso3, hover.f.properties.name)}
        </div>
      )}
    </div>
  );
}
