/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
	  "./pages/**/*.{js,ts,jsx,tsx}",
	  "./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
	  extend: {
		colors: {
		  tovybg: "#284475",
		  orbit: "#284475",
		  primary: 'rgb(var(--group-theme) / <alpha-value>)',
		},
		backgroundImage: theme => ({
		  'infobg-light': "url('/crustiq-l.svg')",
		  'infobg-dark': "url('/crustiq-d.svg')",
		}),
	  },
	},
	plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
  };
