import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { SettingsProvider } from "./state/settings";

export function render(url: string) {
  const helmetContext: Record<string, any> = {};
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <SettingsProvider>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </SettingsProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
  return { html, helmetContext };
}

export default { render };
