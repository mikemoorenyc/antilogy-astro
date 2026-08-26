/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    screens: {
      "md":"960px"
    },
		extend: {
			width: {
				"aBreak": 960
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
	plugins: [],
}
