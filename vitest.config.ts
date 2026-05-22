import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      // `all: true` forces every file matching `include` into the report,
      // even ones the tests don't touch — otherwise uncovered files would silently inflate the average.
      all: true,
      include: ['lib/**/*.ts'],
      exclude: ['lib/db.ts', 'lib/auth.ts', 'lib/seed-db.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
      reporter: ['text', 'html', 'json-summary'],
    },
  },
})
