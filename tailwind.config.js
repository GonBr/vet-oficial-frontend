/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brown-toned palette (warmer, less orange)
        primary: {
          50: '#f7f4f1',
          100: '#ede6dd',
          200: '#dbc9b8',
          300: '#c5a68a',
          400: '#b08660',
          500: '#9a6b3f',
          600: '#825533',
          700: '#6b442a',
          800: '#523424',
          900: '#3d261b',
        },
        // Earth-tone warm palette
        warm: {
          50: '#FFF8F0',
          100: '#FFEEE0',
          200: '#FFD6B8',
          300: '#FFBE90',
          400: '#E6A668',
          500: '#D2691E',
          600: '#B8591A',
          700: '#9E4916',
          800: '#843912',
          900: '#6A290E',
        },
        earth: {
          50: '#F9F7F4',
          100: '#F3EFE9',
          200: '#E7DFD3',
          300: '#DBCFBD',
          400: '#CFBFA7',
          500: '#C3AF91',
          600: '#A0926B',
          700: '#7D7545',
          800: '#5A581F',
          900: '#3D3B15',
        },
        sage: {
          50: '#F6F8F4',
          100: '#EDF1E9',
          200: '#DBE3D3',
          300: '#C9D5BD',
          400: '#B7C7A7',
          500: '#9CAF88',
          600: '#8A9B76',
          700: '#788764',
          800: '#667352',
          900: '#545F40',
        },
        cream: {
          50: '#FEFCF8',
          100: '#FDF9F1',
          200: '#FBF3E3',
          300: '#F9EDD5',
          400: '#F7E7C7',
          500: '#F5E1B9',
          600: '#E6D2A8',
          700: '#D7C397',
          800: '#C8B486',
          900: '#B9A575',
        },
        // Medical accent colors (enhanced saturation)
        medical: {
          red: '#E53E3E',      // More vibrant red for recording status
          cross: '#DC143C',
          safe: '#38A169',     // More vibrant green for success states
          warning: '#D69E2E',  // Enhanced warning color
        },
        // Status colors with enhanced saturation
        status: {
          recording: '#E53E3E',    // Vibrant red for recording
          success: '#38A169',      // Vibrant green for success
          warning: '#D69E2E',      // Enhanced warning
          danger: '#E53E3E',       // Enhanced danger
        }
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(139, 69, 19, 0.08)',
        'warm': '0 4px 20px rgba(210, 105, 30, 0.15)',
        'sage': '0 4px 20px rgba(156, 175, 136, 0.15)',
        'red': '0 4px 20px rgba(205, 92, 92, 0.15)',
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'gentle-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
