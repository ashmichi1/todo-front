import { defineConfig } from 'vite';

// Detect Netlify environment: Netlify sets process.env.NETLIFY = 'true'
const isNetlify = process.env.NETLIFY === 'true';

export default defineConfig({
  // Use root base on Netlify, otherwise keep GitHub Pages base
  base: isNetlify ? '/' : '/tdlst/',
  build: {
    outDir: 'dist',
  },
});