import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  path: string;
}

const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, idx) => (
          <li key={item.path} className="flex items-center gap-2">
            {idx > 0 && <span className="text-slate-300">/</span>}
            {idx === items.length - 1 ? (
              <span className="text-slate-700 font-medium">{item.label}</span>
            ) : (
              <Link to={item.path} className="hover:text-slate-800">{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
