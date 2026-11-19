import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles.css";

const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "");
const app = (
  <StrictMode>
    <BrowserRouter basename={BASENAME} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Pages are pre-rendered in their default state, stamped with their route.
// Hydrate only when the markup is for this exact route with no URL state;
// otherwise (?view=, fit answers, a host serving a fallback page, the dev
// server) render fresh, so markup and app can never disagree.
const root = document.getElementById("root")!;
const here = location.pathname.slice(BASENAME.length).replace(/\/+$/, "") || "/";
if (root.dataset.route === here && !location.search) hydrateRoot(root, app);
else {
  root.textContent = "";
  createRoot(root).render(app);
}
