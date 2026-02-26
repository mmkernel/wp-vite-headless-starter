import { Link, NavLink } from "react-router-dom";
import SearchBox from "./SearchBox";
import { useSettings } from "../state/settings";

const Header = () => {
  const { settings } = useSettings();

  return (
    <header className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-20">
      <div className="container-page flex items-center justify-between py-4 gap-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Go home">
          {settings.logo.imageUrl && (
            <img src={settings.logo.imageUrl} alt={settings.logo.text} className="h-9 w-9 rounded-lg object-cover" loading="lazy" />
          )}
          <span className="text-xl font-semibold tracking-tight">{settings.logo.text}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {settings.navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `transition-colors ${isActive ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <SearchBox compact />
          <Link to="/admin" className="text-xs text-slate-500 hover:text-slate-800">Admin</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
