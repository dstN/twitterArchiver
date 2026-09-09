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
        // Rolldown (the bundler behind Vite 8) replaces Rollup's
        // `manualChunks`. The object form is rejected outright, and the
        // function form is only advisory - Rolldown still placed the shared
        // Vue core (@vue/shared, @vue/reactivity, @vue/runtime-core) into
        // the `icons` chunk because @fortawesome/vue-fontawesome pulls it in.
        //
        // `advancedChunks` with an explicit `priority` is what actually
        // pins them: the highest-priority matching group wins, so `vendor`
        // claims the Vue and i18n runtime before `icons` can absorb it.
        // Without the priorities the grouping silently reverts.
        advancedChunks: {
          groups: [
            {
              name: "vendor",
              priority: 100,
              test: /[\\/]node_modules[\\/](vue|vue-i18n|@vue|@intlify)[\\/]/,
            },
            {
              name: "zip-handler",
              priority: 50,
              test: /[\\/]node_modules[\\/]@zip\.js[\\/]/,
            },
            {
              name: "icons",
              priority: 10,
              test: /[\\/]node_modules[\\/]@fortawesome[\\/]/,
            },
          ],
        },
      },
    },
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,
  },
});
