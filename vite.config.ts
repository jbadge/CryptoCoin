import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

import checkerPkg from 'vite-plugin-checker'
const checker = checkerPkg.default

import linterPkg from 'vite-plugin-linter'
const { EsLinter, linterPlugin } = linterPkg

export default defineConfig((configEnv) => ({
  plugins: [
    reactRefresh(),
    checker({
      typescript: { tsconfigPath: './tsconfig.json' },
      eslint: { files: './src/**/*.{ts,tsx}' },
    }),
    linterPlugin({
      disableForBuild: true,
      include: ['./src/**/*.ts', './src/**/*.tsx'],
      linters: [
        new EsLinter({
          configEnv,
          serveOptions: { cache: false, formatter: 'visualstudio' },
        }),
      ],
    }),
  ],
}))
