import { useEffect } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./routes/Home";
import { Atlas } from "./routes/Atlas";
import { People } from "./routes/People";
import { CountryPage } from "./routes/Country";
import { Countries } from "./routes/Countries";
import { Problems } from "./routes/Problems";
import { ProblemPage } from "./routes/Problem";
import { Fit } from "./routes/Fit";
import { Method } from "./routes/Method";
import { NotFound } from "./components/NotFound";
import { DATA } from "./data/countries";
import { metaFor, REPO_URL } from "./site";

const BASE = import.meta.env.BASE_URL;

export function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = metaFor(pathname).title;
  }, [pathname]);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="nav">
        <div className="wrap">
          <Link to="/" className="brand">
            <img src={`${BASE}favicon.svg`} alt="" width={22} height={22} />
            <span>Builder Atlas</span>
          </Link>
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/atlas">Atlas</NavLink>
            <NavLink to="/people">People</NavLink>
            <NavLink to="/problems">Problems</NavLink>
            <NavLink to="/fit">Find your fit</NavLink>
          </nav>
        </div>
      </header>
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/atlas" element={<Atlas />} />
          <Route path="/people" element={<People />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/country/:iso" element={<CountryPage />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemPage />} />
          <Route path="/fit" element={<Fit />} />
          <Route path="/method" element={<Method />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer>
        <div className="wrap">
          <span>
            Country data: World Bank open data, snapshot {DATA.fetchedAt}. Map: Natural Earth. Every problem figure links to its source.
          </span>
          <span>
            <Link to="/countries">All countries</Link> · <Link to="/method">How this works</Link> ·{" "}
            <a href={REPO_URL}>Source and corrections</a>
          </span>
        </div>
      </footer>
    </>
  );
}
