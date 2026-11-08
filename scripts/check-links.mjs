// Fetches every URL in the problem cards. Dead links fail; sites that block
// automated clients (401/403/429/418) only warn, since a browser still opens them.
import { readdirSync, readFileSync } from "node:fs";
import { parse } from "yaml";

const DIR = new URL("../content/problems/", import.meta.url);
const SOFT = new Set([401, 403, 418, 429]);

const urls = new Map(); // url → files
const walk = (v, file) => {
  if (typeof v === "string" && v.startsWith("https://")) urls.set(v, [...(urls.get(v) ?? []), file]);
  else if (v && typeof v === "object") Object.values(v).forEach((x) => walk(x, file));
};
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".yaml"))) walk(parse(readFileSync(new URL(f, DIR), "utf8")), f);

async function check(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const r = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": "Mozilla/5.0 (link check)" } });
      if (r.ok) return { ok: true };
      if (method === "GET") return { ok: false, status: r.status };
    } catch (e) {
      if (method === "GET") return { ok: false, status: e.name === "TimeoutError" ? "timeout" : e.cause?.code ?? e.message };
    }
  }
}

const failed = [];
const warned = [];
const list = [...urls.keys()];
for (let i = 0; i < list.length; i += 8) {
  await Promise.all(
    list.slice(i, i + 8).map(async (u) => {
      const r = await check(u);
      if (r.ok) return;
      (SOFT.has(r.status) || r.status === "timeout" ? warned : failed).push(`${r.status}  ${u}  (${urls.get(u).join(", ")})`);
    }),
  );
}
warned.forEach((w) => console.warn("warn ", w));
failed.forEach((f) => console.error("FAIL ", f));
console.log(`${list.length} links: ${list.length - failed.length - warned.length} ok, ${warned.length} warn, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
