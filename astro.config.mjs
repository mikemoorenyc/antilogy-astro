// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

import { loadEnv } from 'vite';

const base_url = process.env.NODE_ENV
  ? loadEnv(process.env.NODE_ENV, process.cwd(), '').PUBLIC_SITE_URL
  : '';

export default defineConfig({
  //site: base_url,

  integrations: [
    svelte(),
    react({
      include: ['**/react/*'],
    }),
  ],

  adapter: vercel(),

  image: {
    domains: ['storage.googleapis.com', 'res.cloudinary.com'],
  },

  devToolbar: {
    enabled: false,
  },
});
