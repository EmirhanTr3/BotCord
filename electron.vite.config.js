// import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "node:path";

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
    //   TanStackRouterVite({
    //     routesDirectory: "./src/web/routes/",
    //     generatedRouteTree: "./src/web/routeTree.gen.ts",
    //   }),
    ],
    build: {
      outDir: "out/renderer",
      rollupOptions: {
        input: "./src/renderer/index.html",
      },
    },
  },
});