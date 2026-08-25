// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// "claudemac" is the LAN alias for this machine, allowed so `npm run dev:host`
// can be viewed from another computer.
const allowedHosts = ['claudemac', 'claudemac.local'];

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  server: { allowedHosts },
  vite: {
    plugins: [tailwindcss()],
  },
});
