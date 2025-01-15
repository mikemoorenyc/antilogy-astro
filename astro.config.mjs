// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel';

import auth from 'auth-astro';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({
    nesting: true,
    applyBaseStyles: true,
  }), auth(), react()],
  adapter: vercel(),
  image: {
    domains: ["storage.googleapis.com"],
  },
  devToolbar: {
    enabled: false
  }
});