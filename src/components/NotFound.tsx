import { Link } from "react-router-dom";

export function NotFound({ what = "page" }: { what?: string }) {
  return (
    <div className="wrap">
      <div className="eyebrow">Not found</div>
      <h1>No such {what}</h1>
      <p>
        It may have moved. Try <Link to="/countries">all countries</Link>, <Link to="/problems">all problems</Link> or the <Link to="/">home page</Link>.
      </p>
    </div>
  );
}
