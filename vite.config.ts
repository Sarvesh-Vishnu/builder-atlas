import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { parse } from "yaml";

// Problem cards are YAML on disk and plain JSON in the bundle, so the browser
// ships neither a YAML parser nor the schema library. The schema check runs
// in the test suite, which gates every deploy.
const yamlAsJson = (): Plugin => ({
  name: "yaml-as-json",
  transform(code, id) {
    if (id.endsWith(".yaml")) return { code: `export default ${JSON.stringify(parse(code))};`, map: null };
  },
});

export default defineConfig({
  // Served from sarvesh-vishnu.github.io/builder-atlas/ (GitHub Pages project site).
  base: "/builder-atlas/",
  plugins: [react(), yamlAsJson()],
  server: { port: 5189, strictPort: true },
  test: { environment: "node" },
});
