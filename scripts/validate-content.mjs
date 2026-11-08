// Content gate: parses every card through the TS schema, via the vitest suite
// that owns that check (src/content/content.test.ts).
import { spawnSync } from "node:child_process";

const r = spawnSync("npx", ["vitest", "run", "src/content/content.test.ts"], { stdio: "inherit" });
process.exit(r.status ?? 1);
