// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel';


import react from '@astrojs/react';

import { loadEnv } from "vite";
const base_url = process.env.NODE_ENV? loadEnv(process.env.NODE_ENV, process.cwd(), "").PUBLIC_SITE_URL:"";

// https://astro.build/config
export default defineConfig({
  site:base_url,
  integrations: [tailwind({
    nesting: true,
    applyBaseStyles: true,
  }),  react()],
  adapter: vercel(),
  image: {
    domains: ["storage.googleapis.com"],
  },
  devToolbar: {
    enabled: false
  }
});