import { useSettings } from "../state/settings";
import { Link } from "react-router-dom";

const Footer = () => {
  const { settings } = useSettings();
  return (
    <footer className="border-t border-slate-100 mt-12">
      <div className="container-page py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{settings.logo.text}</p>
          <p className="text-xs text-slate-500">Modern headless WordPress starter.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          {settings.navigation.map((item) => (
            <Link key={item.path} to={item.path} className="hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
