import { useEffect } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./routes/Home";
import { Atlas } from "./routes/Atlas";
import { People } from "./routes/People";
import { CountryPage } from "./routes/Country";
import { Problems } from "./routes/Problems";
import { ProblemPage } from "./routes/Problem";
import { Fit } from "./routes/Fit";
import { DATA } from "./data/countries";

export function App() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return (
    <>
      <header className="nav">
        <div className="wrap">
          <Link to="/" className="brand">
            <img src="/favicon.svg" alt="" width={22} height={22} />
            <span>Builder Atlas</span>
          </Link>
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/atlas">Atlas</NavLink>
            <NavLink to="/people">People</NavLink>
            <NavLink to="/problems">Problems</NavLink>
            <NavLink to="/fit" className="cta">
              Find your fit
            </NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/atlas" element={<Atlas />} />
          <Route path="/people" element={<People />} />
          <Route path="/country/:iso" element={<CountryPage />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemPage />} />
          <Route path="/fit" element={<Fit />} />
          <Route path="*" element={<div className="wrap"><h1>Not found</h1><Link to="/">Home</Link></div>} />
        </Routes>
      </main>
      <footer>
        <div className="wrap">
          Country data from World Bank open data (snapshot {DATA.fetchedAt}). Map: Natural Earth via world-atlas. Problem cards: every figure links to its source.
        </div>
      </footer>
    </>
  );
}
