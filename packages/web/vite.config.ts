import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";
import path from "path";
import { config } from 'dotenv-flow';

config({ path: '../../' });

export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: "**/*.svg",
      svgrOptions: {
        exportType: "named",
      },
    }),
  ],
  root: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/lib/variables.scss" as *;
          @use "sass:color";
        `,
        api: "modern-compiler",
      },
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      plugins: [visualizer()],
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          lodash: ["lodash"],
          firebase: ["@/lib/firebase"],
          state: ["@/lib/state"],
          forms: ["@/components/ui/Forms"],
        }
      }
    }
  }
});
