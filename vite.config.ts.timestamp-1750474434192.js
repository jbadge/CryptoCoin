// vite.config.ts
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import checkerPkg from "vite-plugin-checker";
import linterPkg from "vite-plugin-linter";
var checker = checkerPkg.default;
var { EsLinter, linterPlugin } = linterPkg;
var vite_config_default = defineConfig((configEnv) => ({
  plugins: [
    reactRefresh(),
    checker({
      typescript: { tsconfigPath: "./tsconfig.json" },
      eslint: { files: "./src/**/*.{ts,tsx}" }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3RSZWZyZXNoIGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXJlZnJlc2gnXG5cbmltcG9ydCBjaGVja2VyUGtnIGZyb20gJ3ZpdGUtcGx1Z2luLWNoZWNrZXInXG5jb25zdCBjaGVja2VyID0gY2hlY2tlclBrZy5kZWZhdWx0XG5cbmltcG9ydCBsaW50ZXJQa2cgZnJvbSAndml0ZS1wbHVnaW4tbGludGVyJ1xuY29uc3QgeyBFc0xpbnRlciwgbGludGVyUGx1Z2luIH0gPSBsaW50ZXJQa2dcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChjb25maWdFbnYpID0+ICh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdFJlZnJlc2goKSxcbiAgICBjaGVja2VyKHtcbiAgICAgIHR5cGVzY3JpcHQ6IHsgdHNjb25maWdQYXRoOiAnLi90c2NvbmZpZy5qc29uJyB9LFxuICAgICAgZXNsaW50OiB7IGZpbGVzOiAnLi9zcmMvKiovKi57dHMsdHN4fScgfSxcbiAgICB9KSxcbiAgICBsaW50ZXJQbHVnaW4oe1xuICAgICAgZGlzYWJsZUZvckJ1aWxkOiB0cnVlLFxuICAgICAgaW5jbHVkZTogWycuL3NyYy8qKi8qLnRzJywgJy4vc3JjLyoqLyoudHN4J10sXG4gICAgICBsaW50ZXJzOiBbXG4gICAgICAgIG5ldyBFc0xpbnRlcih7XG4gICAgICAgICAgY29uZmlnRW52LFxuICAgICAgICAgIHNlcnZlT3B0aW9uczogeyBjYWNoZTogZmFsc2UsIGZvcm1hdHRlcjogJ3Zpc3VhbHN0dWRpbycgfSxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgIH0pLFxuICBdLFxufSkpXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxrQkFBa0I7QUFFekIsT0FBTyxnQkFBZ0I7QUFHdkIsT0FBTyxlQUFlO0FBRnRCLElBQU0sVUFBVSxXQUFXO0FBRzNCLElBQU0sRUFBRSxVQUFVLGFBQWEsSUFBSTtBQUVuQyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxlQUFlO0FBQUEsRUFDMUMsU0FBUztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLE1BQ04sWUFBWSxFQUFFLGNBQWMsa0JBQWtCO0FBQUEsTUFDOUMsUUFBUSxFQUFFLE9BQU8sc0JBQXNCO0FBQUEsSUFDekMsQ0FBQztBQUFBLElBQ0QsYUFBYTtBQUFBLE1BQ1gsaUJBQWlCO0FBQUEsTUFDakIsU0FBUyxDQUFDLGlCQUFpQixnQkFBZ0I7QUFBQSxNQUMzQyxTQUFTO0FBQUEsUUFDUCxJQUFJLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQSxjQUFjLEVBQUUsT0FBTyxPQUFPLFdBQVcsZUFBZTtBQUFBLFFBQzFELENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
