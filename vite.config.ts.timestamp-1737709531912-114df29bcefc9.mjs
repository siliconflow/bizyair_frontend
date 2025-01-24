// vite.config.ts
import autoprefixer from "file:///D:/workspace/ComfyUI-master/2024-12-6%20152839/ComfyUI-master/custom_nodes/BizyAir/bizyair_frontend/node_modules/autoprefixer/lib/autoprefixer.js";
import tailwind from "file:///D:/workspace/ComfyUI-master/2024-12-6%20152839/ComfyUI-master/custom_nodes/BizyAir/bizyair_frontend/node_modules/tailwindcss/lib/index.js";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///D:/workspace/ComfyUI-master/2024-12-6%20152839/ComfyUI-master/custom_nodes/BizyAir/bizyair_frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/workspace/ComfyUI-master/2024-12-6%20152839/ComfyUI-master/custom_nodes/BizyAir/bizyair_frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///D:/workspace/ComfyUI-master/2024-12-6%20152839/ComfyUI-master/custom_nodes/BizyAir/bizyair_frontend/node_modules/unplugin-auto-import/dist/vite.js";
import cssInjectedByJsPlugin from "file:///D:/workspace/ComfyUI-master/2024-12-6%20152839/ComfyUI-master/custom_nodes/BizyAir/bizyair_frontend/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
import postcssNesting from "file:///D:/workspace/ComfyUI-master/2024-12-6%20152839/ComfyUI-master/custom_nodes/BizyAir/bizyair_frontend/node_modules/tailwindcss/nesting/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/workspace/ComfyUI-master/2024-12-6%20152839/ComfyUI-master/custom_nodes/BizyAir/bizyair_frontend/vite.config.ts";
var vite_config_default = defineConfig({
  define: {
    "process.env": {}
  },
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer(), postcssNesting()]
    }
  },
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue"]
    }),
    cssInjectedByJsPlugin()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    outDir: "../js",
    cssCodeSplit: false,
    lib: {
      entry: "src/main.ts",
      name: "bizyAirLib",
      formats: ["umd"],
      fileName: () => `bizyair_frontend.js`
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true
      }
    }
  },
  server: {
    port: 5174,
    proxy: {
      "/bizyair": {
        target: "http://localhost:8188",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bizyair/, "/bizyair/")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3Jrc3BhY2VcXFxcQ29tZnlVSS1tYXN0ZXJcXFxcMjAyNC0xMi02IDE1MjgzOVxcXFxDb21meVVJLW1hc3RlclxcXFxjdXN0b21fbm9kZXNcXFxcQml6eUFpclxcXFxiaXp5YWlyX2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3b3Jrc3BhY2VcXFxcQ29tZnlVSS1tYXN0ZXJcXFxcMjAyNC0xMi02IDE1MjgzOVxcXFxDb21meVVJLW1hc3RlclxcXFxjdXN0b21fbm9kZXNcXFxcQml6eUFpclxcXFxiaXp5YWlyX2Zyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93b3Jrc3BhY2UvQ29tZnlVSS1tYXN0ZXIvMjAyNC0xMi02JTIwMTUyODM5L0NvbWZ5VUktbWFzdGVyL2N1c3RvbV9ub2Rlcy9CaXp5QWlyL2JpenlhaXJfZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcidcclxuaW1wb3J0IHRhaWx3aW5kIGZyb20gJ3RhaWx3aW5kY3NzJ1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCBjc3NJbmplY3RlZEJ5SnNQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tY3NzLWluamVjdGVkLWJ5LWpzJ1xyXG5pbXBvcnQgcG9zdGNzc05lc3RpbmcgZnJvbSAndGFpbHdpbmRjc3MvbmVzdGluZyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGRlZmluZToge1xyXG4gICAgJ3Byb2Nlc3MuZW52Jzoge31cclxuICB9LFxyXG4gIGNzczoge1xyXG4gICAgcG9zdGNzczoge1xyXG4gICAgICBwbHVnaW5zOiBbdGFpbHdpbmQoKSwgYXV0b3ByZWZpeGVyKCksIHBvc3Rjc3NOZXN0aW5nKCldLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFsndnVlJ10sXHJcbiAgICB9KSxcclxuICAgIGNzc0luamVjdGVkQnlKc1BsdWdpbigpXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJy4uL2pzJyxcclxuICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsXHJcbiAgICBsaWI6IHtcclxuICAgICAgZW50cnk6ICdzcmMvbWFpbi50cycsXHJcbiAgICAgIG5hbWU6ICdiaXp5QWlyTGliJyxcclxuICAgICAgZm9ybWF0czogWyd1bWQnXSxcclxuICAgICAgZmlsZU5hbWU6ICgpID0+IGBiaXp5YWlyX2Zyb250ZW5kLmpzYCxcclxuICAgIH0sXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIGV4dGVybmFsOiBbXSxcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgaW5saW5lRHluYW1pY0ltcG9ydHM6IHRydWVcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTc0LFxyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9iaXp5YWlyJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODE4OCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9iaXp5YWlyLywgJy9iaXp5YWlyLycpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdWUsT0FBTyxrQkFBa0I7QUFDaGdCLE9BQU8sY0FBYztBQUNyQixTQUFTLGVBQWUsV0FBVztBQUNuQyxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTywyQkFBMkI7QUFDbEMsT0FBTyxvQkFBb0I7QUFQOFIsSUFBTSwyQ0FBMkM7QUFTMVcsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sZUFBZSxDQUFDO0FBQUEsRUFDbEI7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILFNBQVM7QUFBQSxNQUNQLFNBQVMsQ0FBQyxTQUFTLEdBQUcsYUFBYSxHQUFHLGVBQWUsQ0FBQztBQUFBLElBQ3hEO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osV0FBVztBQUFBLE1BQ1QsU0FBUyxDQUFDLEtBQUs7QUFBQSxJQUNqQixDQUFDO0FBQUEsSUFDRCxzQkFBc0I7QUFBQSxFQUN4QjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLEtBQUs7QUFBQSxNQUNILE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFNBQVMsQ0FBQyxLQUFLO0FBQUEsTUFDZixVQUFVLE1BQU07QUFBQSxJQUNsQjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDO0FBQUEsTUFDWCxRQUFRO0FBQUEsUUFDTixzQkFBc0I7QUFBQSxNQUN4QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxZQUFZO0FBQUEsUUFDVixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsY0FBYyxXQUFXO0FBQUEsTUFDM0Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
