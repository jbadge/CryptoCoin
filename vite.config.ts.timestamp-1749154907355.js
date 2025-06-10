// vite.config.ts
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import checker from "vite-plugin-checker";
import { EsLinter, linterPlugin } from "vite-plugin-linter";
var vite_config_default = defineConfig((configEnv) => ({
  plugins: [
    reactRefresh(),
    checker({
      typescript: { tsconfigPath: "./tsconfig.json" }
    }),
    linterPlugin({
      disableForBuild: true,
      include: ["./src/**/*.ts", "./src/**/*.tsx"],
      linters: [
        new EsLinter({
          configEnv,
          serveOptions: { cache: false, formatter: "visualstudio" }
        })
      ]
    })
  ]
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiBAdHlwZSB7aW1wb3J0KCd2aXRlJykuVXNlckNvbmZpZ30gKi9cblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdFJlZnJlc2ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QtcmVmcmVzaCdcbmltcG9ydCBjaGVja2VyIGZyb20gJ3ZpdGUtcGx1Z2luLWNoZWNrZXInXG5pbXBvcnQgeyBFc0xpbnRlciwgbGludGVyUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4tbGludGVyJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChjb25maWdFbnYpID0+ICh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdFJlZnJlc2goKSxcbiAgICBjaGVja2VyKHtcbiAgICAgIC8vIFR5cGVTY3JpcHQgY29uZmlnXG4gICAgICB0eXBlc2NyaXB0OiB7IHRzY29uZmlnUGF0aDogJy4vdHNjb25maWcuanNvbicgfSxcbiAgICB9KSxcbiAgICBsaW50ZXJQbHVnaW4oe1xuICAgICAgZGlzYWJsZUZvckJ1aWxkOiB0cnVlLFxuICAgICAgaW5jbHVkZTogWycuL3NyYy8qKi8qLnRzJywgJy4vc3JjLyoqLyoudHN4J10sXG4gICAgICBsaW50ZXJzOiBbXG4gICAgICAgIG5ldyBFc0xpbnRlcih7XG4gICAgICAgICAgY29uZmlnRW52OiBjb25maWdFbnYsXG4gICAgICAgICAgc2VydmVPcHRpb25zOiB7IGNhY2hlOiBmYWxzZSwgZm9ybWF0dGVyOiAndmlzdWFsc3R1ZGlvJyB9LFxuICAgICAgICB9KSxcbiAgICAgIF0sXG4gICAgfSksXG4gIF0sXG59KSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGtCQUFrQjtBQUN6QixPQUFPLGFBQWE7QUFDcEIsU0FBUyxVQUFVLG9CQUFvQjtBQUd2QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxlQUFlO0FBQUEsRUFDMUMsU0FBUztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLE1BRU4sWUFBWSxFQUFFLGNBQWMsa0JBQWtCO0FBQUEsSUFDaEQsQ0FBQztBQUFBLElBQ0QsYUFBYTtBQUFBLE1BQ1gsaUJBQWlCO0FBQUEsTUFDakIsU0FBUyxDQUFDLGlCQUFpQixnQkFBZ0I7QUFBQSxNQUMzQyxTQUFTO0FBQUEsUUFDUCxJQUFJLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQSxjQUFjLEVBQUUsT0FBTyxPQUFPLFdBQVcsZUFBZTtBQUFBLFFBQzFELENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
