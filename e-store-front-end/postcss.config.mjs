import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    // `base` is the directory used for resolving `tailwindcss` and scanning sources (not `root`).
    // Must be this app folder so packages resolve from e-store-front-end/node_modules.
    "@tailwindcss/postcss": {
      base: __dirname,
    },
  },
};
export default config;