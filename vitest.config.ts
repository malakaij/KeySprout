import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/db.ts', 'lib/auth.ts', 'lib/seed-db.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
      reporter: ['text', 'html'],
    },
  },
})
