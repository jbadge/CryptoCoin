/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import checker from 'vite-plugin-checker'
import { EsLinter, linterPlugin } from 'vite-plugin-linter'

export default defineConfig((configEnv) => ({
  plugins: [
    reactRefresh(),
    checker({
      typescript: { tsconfigPath: './tsconfig.json' },
    }),
    linterPlugin({
      disableForBuild: true,
      include: ['./src/**/*.ts', './src/**/*.tsx'],
      linters: [
        new EsLinter({
          configEnv: configEnv,
          serveOptions: { cache: false, formatter: 'visualstudio' },
        }),
      ],
    }),
  ],
  server: {
    port: 3000,
  },
}))
