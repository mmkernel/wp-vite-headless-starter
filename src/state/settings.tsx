import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import defaults from "../config/default-settings.json" assert { type: "json" };

export type PaletteKey =
  | "slate" | "zinc" | "neutral" | "stone" | "gray" | "blue" | "indigo"
  | "violet" | "emerald" | "teal" | "rose" | "amber";

const palette: Record<PaletteKey, Record<string, string>> = {
  slate: { 500: "#64748b", 600: "#475569", 900: "#0f172a" },
  zinc: { 500: "#71717a", 600: "#52525b", 900: "#18181b" },
  neutral: { 500: "#737373", 600: "#525252", 900: "#171717" },
  stone: { 500: "#78716c", 600: "#57534e", 900: "#1c1917" },
  gray: { 500: "#6b7280", 600: "#4b5563", 900: "#111827" },
  blue: { 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" },
  indigo: { 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca" },
  violet: { 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9" },
  emerald: { 500: "#10b981", 600: "#059669", 700: "#047857" },
  teal: { 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e" },
  rose: { 500: "#f43f5e", 600: "#e11d48", 700: "#be123c" },
  amber: { 500: "#f59e0b", 600: "#d97706", 700: "#b45309" }
};

export type BrandColorToken = `${PaletteKey}-${500 | 600 | 700 | 900}`;

export interface Settings {
  canonicalBaseUrl: string;
  wpBasePath: string;
  brand: {
    primary: BrandColorToken;
    secondary: BrandColorToken;
    accent: BrandColorToken;
  };
  logo: { text: string; imageUrl?: string };
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    description: string;
    ogImage?: string;
    twitter: { site?: string; creator?: string };
  };
  navigation: { label: string; path: string }[];
}

export interface SettingsContextValue {
  settings: Settings;
  setSettings: (next: Settings) => void;
  reset: () => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
}

const STORAGE_KEY = "site_settings_v1";

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const resolveColor = (token: BrandColorToken) => {
  const [key, shade] = token.split("-") as [PaletteKey, string];
  return palette[key]?.[shade] ?? "#2563eb";
};

const applyBrandVariables = (brand: Settings["brand"]) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--brand-primary", resolveColor(brand.primary));
  root.style.setProperty("--brand-secondary", resolveColor(brand.secondary));
  root.style.setProperty("--brand-accent", resolveColor(brand.accent));
};

const loadSettings = (): Settings => {
  const envDefaults: Partial<Settings> = {
    canonicalBaseUrl: import.meta.env.VITE_CANONICAL_BASE || (defaults as Settings).canonicalBaseUrl,
    wpBasePath: import.meta.env.VITE_WP_BASE_PATH || (defaults as Settings).wpBasePath
  };
  if (typeof window === "undefined") return { ...(defaults as Settings), ...envDefaults } as Settings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...(defaults as Settings), ...envDefaults, ...parsed };
    }
  } catch (err) {
    console.warn("Failed to parse stored settings", err);
  }
  return { ...(defaults as Settings), ...envDefaults } as Settings;
};

const persistSettings = (settings: Settings) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    applyBrandVariables(settings.brand);
    persistSettings(settings);
  }, [settings]);

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    setSettings: (next) => setSettingsState(next),
    reset: () => setSettingsState(defaults as Settings),
    exportJson: () => JSON.stringify(settings, null, 2),
    importJson: (json: string) => {
      try {
        const parsed = JSON.parse(json);
        setSettingsState({ ...(defaults as Settings), ...parsed });
        return true;
      } catch (err) {
        console.error("Failed to import settings", err);
        return false;
      }
    }
  }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

export const brandTokens = Object.keys(palette) as PaletteKey[];
export const paletteShades = ["500", "600", "700", "900"];

export const adminGuard = (pathname: string) => {
  const adminCode = import.meta.env.VITE_ADMIN_CODE;
  const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
  if (!adminCode && !isLocalhost) return false;
  if (!pathname.startsWith("/admin")) return true;
  return true;
};
