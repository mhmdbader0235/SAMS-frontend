/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#162032',
        },
        // SchoolDesk brand teal, replacing Tailwind's default `blue` ramp.
        // `blue-*` is the app's de facto accent color across every view
        // (buttons, active nav state, badges, focus rings, the workflow
        // stepper) -- overriding it here recolors the whole app to the
        // brand palette without touching every component file. Anchored
        // exactly on the three brand hexes at 500/600/800; the rest of the
        // ramp is generated in the same hue (~184deg) so light tints (used
        // for soft badge backgrounds) and dark shades (used for dark-mode
        // hover/active states) stay in the same family instead of drifting
        // toward generic cyan or navy.
        blue: {
          50: '#F4F8F9',
          100: '#E4F1F2',
          200: '#C1E3E6',
          300: '#88D7DD',
          400: '#38D1DC',
          500: '#00B7B5', // brand: bright teal
          600: '#018790', // brand: mid teal (primary buttons / active state)
          700: '#007078',
          800: '#005461', // brand: dark teal
          900: '#014448',
          950: '#03282B',
        },
        // Kept in sync with `blue` above -- not used directly by any
        // component today (grep shows zero `primary-*` usages), but this is
        // the named brand scale should something reference it later.
        primary: {
          50: '#F4F8F9',
          100: '#E4F1F2',
          200: '#C1E3E6',
          300: '#88D7DD',
          400: '#38D1DC',
          500: '#00B7B5',
          600: '#018790',
          700: '#007078',
          800: '#005461',
          900: '#014448',
          950: '#03282B',
        },
        surface: {
          dark: '#0f172a',
          light: '#ffffff',
          subtle: 'var(--color-surface-subtle)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
