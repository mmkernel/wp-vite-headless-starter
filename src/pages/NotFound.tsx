import { Link } from "react-router-dom";
import { PageSEO } from "../seo/meta";

const NotFoundPage = () => (
  <div className="text-center space-y-4 py-16">
    <PageSEO title="Not Found" description="The page was not found" path="/404" noIndex />
    <p className="text-sm text-blue-700 uppercase tracking-[0.2em]">404</p>
    <h1 className="text-4xl font-semibold">Page not found</h1>
    <p className="text-slate-600">Sorry, we couldn't find what you were looking for.</p>
    <Link to="/" className="btn btn-primary">Back home</Link>
  </div>
);

export default NotFoundPage;
