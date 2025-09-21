import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  target: 'es2020',
  sourcemap: true,
  minify: false,
  clean: true,
});
