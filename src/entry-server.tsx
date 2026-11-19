import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { App } from "./App";

export { allRoutes, metaFor, SITE_URL } from "./site";

const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Renders an app route (e.g. "/country/VNM", without the base path). */
export function render(route: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={BASENAME + route} basename={BASENAME} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}
