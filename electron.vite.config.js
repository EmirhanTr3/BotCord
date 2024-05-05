import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: "src/main/index.ts",
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: "src/main/preload.ts",
      },
    },
  },
  renderer: {
    root: "src/renderer/",
    plugins: [
      react(),
      TanStackRouterVite({
        routesDirectory: "./src/renderer/routes/",
        generatedRouteTree: "./src/renderer/routeTree.gen.ts",
      }),
    ],
    build: {
      outDir: "out/renderer",
      rollupOptions: {
        input: "./src/renderer/index.html",
      },
    },
  },
});