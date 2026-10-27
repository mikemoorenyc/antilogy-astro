/** @type {import('tailwindcss').Config} */
const { addDynamicIconSelectors } = require("@iconify/tailwind");
export default {

  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  plugins: [
    addDynamicIconSelectors(),
  ],
  theme: {

		extend: {
			width: {
				"aBreak": 960
      },
      screens: {
        "md": "960px",
      },
      spacing: {
        "gutter": "var(--gutter)"
      },
			colors: {
				"foreground": "var(--for)",
				"background": "var(--bg)",
				"action" : "var(--action)",
				"background85": "rgba(0,0,0,.85)",
				"accent" : "var(--accent)",
				"caution": "#991b1b"
			},
			fontFamily: {
				"mono": "var(--font-mono)",
				"serif" : "var(--font-serif)",
				"heading" : "var(--font-heading)"
			},
			fontSize: {
				"smDisplay": 11
			}
		},
	},


}
