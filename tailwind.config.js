const scaleFactor = 0.9

module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'], 
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        md: '1rem',
        lg: '1rem',
        xl: '6rem',
        '2xl': '8rem',
      },
    },
    extend: {
      width: {
        '320': '80rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      colors: {
        current: '#050505',
        borderline: '#d0d4da',
        borderlinedark: '#37373a',
        darko: '#141414',
        whito: '#fcfcfc',
        orango: '#ff7700',
        orangodark: '#dd5500',
      },
      textColor: {
        skin: {
          base: 'var(--color-text-base)',
          inverted: 'var(--color-text-inverted)',
          muted: 'var(--color-text-muted)',
          white: 'var(--color-text-white)',
        },
      },
      backgroundColor: {
        skin: {
          fill: 'var(--color-fill)',
          dark: 'var(--color-dark)',
          bgdark: 'var(--color-bgdark)',
          darkmode: 'var(--color-darkmode)',
          'button-accent': 'var(--color-button-accent)',
          'button-accent-hover': 'var(--color-button-accent-hover)',
          'button-muted': 'var(--color-button-muted)',
        }
      },
      animation: {
        Loading: 'Loading 10s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        slideIn: 'slideIn 0.4s cubic-bezier(1, 0, 0, 0  )'
        // Nothing: 'Loading 10s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        //  loading animation
        Loading: {
          '0%, 100% ': {
            opacity: 0.1,
          },
          '50%': {
            opacity: 0.1,
          }
        },
        //  slidein animation
        slideIn: {
          '75%, 100% ': {
            transform: 'scale(1)',
            opacity: 1,
          },
          '0%,50%': {
            transform: 'scale(1)',
            opacity: 0,
          }
        }
      },
      screens: {
        'xs': '1366px',
        'std': '1536px',
        '3xl': '1800px',
        '4xl': '2560px'
      },
      gridTemplateColumns: {
        '18': 'repeat(18, minmax(0, 1fr))',
        '24': 'repeat(24, minmax(0, 1fr))'
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
        'span-17': 'span 17 / span 17',
        'span-18': 'span 18 / span 18',
        'span-19': 'span 19 / span 19',
        'span-20': 'span 20 / span 20',
        'span-21': 'span 21 / span 21',
        'span-22': 'span 22 / span 22',
        'span-23': 'span 23 / span 23',
        'span-24': 'span 24 / span 24',
      }
    },
    fontSize: {
      'xxs': '.65rem',
      'xs': '.75rem',
      'sm': '.85rem',
      'tiny': '.8rem',
      'base': '0.95rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
    },
    spacing: {
      px: '1px',
      0: '0',
      0.5: scaleFactor * 0.125 + 'rem',
      1: scaleFactor * 0.25 + 'rem',
      1.5: scaleFactor * 0.375 + 'rem',
      2: scaleFactor * 0.5 + 'rem',
      2.5: scaleFactor * 0.625 + 'rem',
      3: scaleFactor * 0.75 + 'rem',
      3.5: scaleFactor * 0.875 + 'rem',
      4: scaleFactor * 1 + 'rem',
      5: scaleFactor * 1.25 + 'rem',
      6: scaleFactor * 1.5 + 'rem',
      7: scaleFactor * 1.75 + 'rem',
      8: scaleFactor * 2 + 'rem',
      9: scaleFactor * 2.25 + 'rem',
      10: scaleFactor * 2.5 + 'rem',
      11: scaleFactor * 2.75 + 'rem',
      12: scaleFactor * 3 + 'rem',
      14: scaleFactor * 3.5 + 'rem',
      16: scaleFactor * 4 + 'rem',
      20: scaleFactor * 5 + 'rem',
      24: scaleFactor * 6 + 'rem',
      28: scaleFactor * 7 + 'rem',
      32: scaleFactor * 8 + 'rem',
      36: scaleFactor * 9 + 'rem',
      40: scaleFactor * 10 + 'rem',
      44: scaleFactor * 11 + 'rem',
      48: scaleFactor * 12 + 'rem',
      52: scaleFactor * 13 + 'rem',
      56: scaleFactor * 14 + 'rem',
      60: scaleFactor * 15 + 'rem',
      64: scaleFactor * 16 + 'rem',
      72: scaleFactor * 18 + 'rem',
      80: scaleFactor * 20 + 'rem',
      96: scaleFactor * 24 + 'rem',
    }
  },
  variants: {
    extend: {
      filter: ['dark'],
      sepia: ['dark'],
      grayscale: ['dark'],
      opacity: ['dark'],
      'animate-none': ['dark'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp')
  ],
}