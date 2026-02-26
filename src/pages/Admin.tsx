import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings, brandTokens, paletteShades, Settings } from "../state/settings";
import { PageSEO } from "../seo/meta";

const AdminPage = () => {
  const { settings, setSettings, reset, exportJson, importJson } = useSettings();
  const [passcode, setPasscode] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const adminCode = import.meta.env.VITE_ADMIN_CODE;

  useEffect(() => {
    const hostname = window.location.hostname;
    if (!adminCode && hostname === "localhost") setAllowed(true);
  }, [adminCode]);

  const handleCheck = () => {
    if (!adminCode) {
      setAllowed(window.location.hostname === "localhost");
      setMessage(!adminCode ? "No admin code set; only localhost allowed." : null);
      return;
    }
    if (passcode === adminCode) {
      setAllowed(true);
      setMessage(null);
    } else {
      setMessage("Invalid code");
    }
  };

  const update = (partial: Partial<Settings>) => setSettings({ ...settings, ...partial });

  const updateBrandToken = (key: keyof Settings["brand"], palette: string, shade: string) => {
    update({ brand: { ...settings.brand, [key]: `${palette}-${shade}` as any } });
  };

  const handleNavChange = (index: number, field: "label" | "path", value: string) => {
    const next = settings.navigation.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    update({ navigation: next });
  };

  const addNavItem = () => update({ navigation: [...settings.navigation, { label: "New", path: "/" }] });
  const removeNavItem = (index: number) => update({ navigation: settings.navigation.filter((_, idx) => idx !== index) });

  const handleImport = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const ok = importJson(text);
      setMessage(ok ? "Imported" : "Failed to import");
    });
  };

  const paletteOptions = useMemo(() => brandTokens.map((name) => ({ name, shades: paletteShades })), []);

  if (!allowed) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <PageSEO title="Admin" description="Settings admin" path="/admin" noIndex />
        <p className="text-sm text-amber-600">This is not a secure auth system.</p>
        {adminCode ? (
          <div className="space-y-3 card p-4">
            <label className="text-sm text-slate-700">Enter admin code</label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
            />
            <button onClick={handleCheck} className="btn btn-primary w-full">Continue</button>
            {message && <p className="text-sm text-red-600">{message}</p>}
          </div>
        ) : (
          <div className="card p-4 space-y-2 text-sm text-slate-600">
            <p>No admin code set; access allowed only on localhost.</p>
            <button onClick={() => handleCheck()} className="btn btn-primary">Check</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageSEO title="Site Settings" description="Admin" path="/admin" noIndex />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Site Settings</h1>
        <button className="text-sm text-slate-500" onClick={() => navigate(-1)}>Back</button>
      </div>
      <p className="text-sm text-amber-600">This is not a secure auth system. Do not store secrets.</p>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <section className="card p-5 space-y-4">
            <h2 className="text-xl font-semibold">General</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1 text-sm">
                <span>Canonical Base URL</span>
                <input
                  value={settings.canonicalBaseUrl}
                  onChange={(e) => update({ canonicalBaseUrl: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  placeholder="https://example.com"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>WP Base Path</span>
                <input
                  value={settings.wpBasePath}
                  onChange={(e) => update({ wpBasePath: e.target.value || "/backend" })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1 text-sm">
                <span>Logo text</span>
                <input
                  value={settings.logo.text}
                  onChange={(e) => update({ logo: { ...settings.logo, text: e.target.value } })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Logo image URL (optional)</span>
                <input
                  value={settings.logo.imageUrl || ""}
                  onChange={(e) => update({ logo: { ...settings.logo, imageUrl: e.target.value } })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </label>
            </div>
          </section>

          <section className="card p-5 space-y-4">
            <h2 className="text-xl font-semibold">Branding</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {["primary", "secondary", "accent"].map((key) => (
                <div key={key} className="space-y-2">
                  <p className="text-sm font-medium capitalize">{key} color</p>
                  <div className="flex gap-2">
                    <select
                      className="border border-slate-200 rounded-lg px-3 py-2 w-1/2"
                      value={settings.brand[key as keyof Settings["brand"]].split("-")[0]}
                      onChange={(e) => updateBrandToken(key as keyof Settings["brand"], e.target.value, settings.brand[key as keyof Settings["brand"]].split("-")[1])}
                    >
                      {paletteOptions.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <select
                      className="border border-slate-200 rounded-lg px-3 py-2 w-1/2"
                      value={settings.brand[key as keyof Settings["brand"]].split("-")[1]}
                      onChange={(e) => updateBrandToken(key as keyof Settings["brand"], settings.brand[key as keyof Settings["brand"]].split("-")[0], e.target.value)}
                    >
                      {paletteShades.map((shade) => (
                        <option key={shade} value={shade}>{shade}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5 space-y-4">
            <h2 className="text-xl font-semibold">SEO Defaults</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1 text-sm">
                <span>Title template</span>
                <input
                  value={settings.seo.titleTemplate}
                  onChange={(e) => update({ seo: { ...settings.seo, titleTemplate: e.target.value } })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Default title</span>
                <input
                  value={settings.seo.defaultTitle}
                  onChange={(e) => update({ seo: { ...settings.seo, defaultTitle: e.target.value } })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </label>
            </div>
            <label className="space-y-1 text-sm block">
              <span>Default meta description</span>
              <textarea
                value={settings.seo.description}
                onChange={(e) => update({ seo: { ...settings.seo, description: e.target.value } })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                rows={3}
              />
            </label>
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="space-y-1 text-sm">
                <span>OG image URL</span>
                <input
                  value={settings.seo.ogImage || ""}
                  onChange={(e) => update({ seo: { ...settings.seo, ogImage: e.target.value } })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Twitter @site</span>
                <input
                  value={settings.seo.twitter.site || ""}
                  onChange={(e) => update({ seo: { ...settings.seo, twitter: { ...settings.seo.twitter, site: e.target.value } } })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Twitter @creator</span>
                <input
                  value={settings.seo.twitter.creator || ""}
                  onChange={(e) => update({ seo: { ...settings.seo, twitter: { ...settings.seo.twitter, creator: e.target.value } } })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </label>
            </div>
          </section>

          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Navigation</h2>
              <button className="btn btn-outline" onClick={addNavItem}>Add link</button>
            </div>
            <div className="space-y-3">
              {settings.navigation.map((item, idx) => (
                <div key={idx} className="grid sm:grid-cols-12 gap-3 items-center">
                  <input
                    value={item.label}
                    onChange={(e) => handleNavChange(idx, "label", e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 sm:col-span-4"
                    placeholder="Label"
                  />
                  <input
                    value={item.path}
                    onChange={(e) => handleNavChange(idx, "path", e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 sm:col-span-6"
                    placeholder="/path"
                  />
                  <button className="btn btn-outline sm:col-span-2" onClick={() => removeNavItem(idx)}>Remove</button>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5 space-y-3">
            <h2 className="text-xl font-semibold">Data</h2>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(exportJson())}>Copy JSON</button>
              <label className="btn btn-outline cursor-pointer">
                Import JSON
                <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
              </label>
              <button className="btn btn-outline" onClick={() => {
                const blob = new Blob([exportJson()], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "site-settings.json";
                a.click();
                URL.revokeObjectURL(url);
              }}>Export JSON</button>
              <button className="btn btn-outline" onClick={() => reset()}>Reset to defaults</button>
            </div>
          </section>
        </div>

        <aside className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Live preview</h2>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3" style={{ backgroundColor: "var(--brand-primary)", color: "white" }}>
              <p className="font-semibold">{settings.logo.text}</p>
            </div>
            <div className="p-4 space-y-2 bg-white">
              <p className="text-sm text-slate-500">Navigation</p>
              <div className="flex flex-wrap gap-2">
                {settings.navigation.map((item) => (
                  <span key={item.path} className="px-3 py-1 rounded-full border border-slate-200 text-sm">{item.label}</span>
                ))}
              </div>
              <p className="text-sm text-slate-500">Buttons</p>
              <div className="flex gap-2">
                <span className="btn btn-primary">Primary</span>
                <span className="btn btn-outline">Outline</span>
              </div>
            </div>
            <div className="px-4 py-3" style={{ backgroundColor: "var(--brand-secondary)", color: "white" }}>
              <p className="text-sm">Footer area</p>
            </div>
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
        </aside>
      </div>
    </div>
  );
};

export default AdminPage;
