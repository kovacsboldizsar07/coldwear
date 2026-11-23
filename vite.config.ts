import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Plain Vite + TanStack Start setup with no Lovable dependency.
// The server bundle is built by nitro for Cloudflare Workers (cloudflare-module preset).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) define[`import.meta.env.${key}`] = JSON.stringify(value);

  return {
    define,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // src/server.ts is our SSR error wrapper.
        server: { entry: "server" },
        importProtection: { behavior: "error", client: { files: ["**/server/**"], specifiers: ["server-only"] } },
      }),
      nitro({ preset: "cloudflare-module", cloudflare: { deployConfig: true, nodeCompat: true } }),
      viteReact(),
    ],
  };
});
