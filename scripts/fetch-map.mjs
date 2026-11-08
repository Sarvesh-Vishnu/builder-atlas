// Natural Earth 1:110m via world-atlas, with ISO-3 codes attached so the map
// can join to World Bank rows.
import { writeFile } from "node:fs/promises";
import countries from "i18n-iso-countries";

const URL_110M = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
const topo = await (await fetch(URL_110M)).json();
// Kosovo has no ISO numeric; Natural Earth leaves it unnumbered, World Bank uses XKX.
const MANUAL = { Kosovo: "XKX" };
let missing = 0;
for (const g of topo.objects.countries.geometries) {
  const iso3 = (g.id && countries.numericToAlpha3(g.id)) || MANUAL[g.properties.name] || null;
  g.properties.iso3 = iso3;
  if (!iso3) missing++;
}
await writeFile(new URL("../src/data/world-110m.json", import.meta.url), JSON.stringify(topo));
console.log(`wrote map; ${missing} shapes without ISO-3 (disputed/unassigned areas, drawn as no-data)`);
