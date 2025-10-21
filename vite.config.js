import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/", // Clean URLs for Vercel (no /twitterArchiver/ needed)
  server: {
    port: 3000,
  },
  build: {
    target: "es2015", // Modern browsers only, no unnecessary polyfills
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    cssCodeSplit: true, // Split CSS for better caching
    // Optimize chunk size
    rollupOptions: {
      output: {
        // Better file naming for long-term caching
        assetFileNames: (assetInfo) => {
          // Keep font files with stable names for better caching
          if (assetInfo.name?.match(/\.(woff2?|eot|ttf|otf|svg)$/)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
        manualChunks: {
          vendor: ["vue", "vue-i18n"],
          "zip-handler": ["jszip"],
          icons: [
            "@fortawesome/fontawesome-svg-core",
            "@fortawesome/free-solid-svg-icons",
            "@fortawesome/free-brands-svg-icons",
            "@fortawesome/vue-fontawesome",
          ],
        },
      },
    },
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,
  },
});
