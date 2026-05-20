/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FDFAF6', 50: '#FDFAF6', 100: '#F8F3EB', 200: '#F0E8D8' },
        terra: { DEFAULT: '#D4622A', light: '#E07A45', dark: '#B8501F', pale: '#FDF0EA', muted: 'rgba(212,98,42,0.10)' },
        stone: { 50:'#F9F6F1', 100:'#EDE7DC', 200:'#D6CCBE', 300:'#B8A99A', 400:'#8F7E6E', 500:'#6B5B4E', 600:'#4A3D33', 700:'#2E2520', 800:'#1A1410' },
        sage: { DEFAULT:'#6A9A72', light:'#8DB894' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px', sm:'4px', md:'10px', lg:'14px', xl:'18px', '2xl':'24px', '3xl':'32px', pill:'999px',
      },
      boxShadow: {
        'xs':    '0 1px 3px rgba(60,40,20,0.06)',
        'sm':    '0 2px 8px rgba(60,40,20,0.08)',
        'md':    '0 4px 16px rgba(60,40,20,0.10)',
        'lg':    '0 8px 32px rgba(60,40,20,0.12)',
        'xl':    '0 16px 48px rgba(60,40,20,0.14)',
        '2xl':   '0 24px 64px rgba(60,40,20,0.18)',
        'float': '0 8px 40px rgba(60,40,20,0.14), 0 2px 8px rgba(60,40,20,0.06)',
        'terra': '0 4px 20px rgba(212,98,42,0.25)',
        'card':  '0 1px 3px rgba(60,40,20,0.05), 0 4px 12px rgba(60,40,20,0.06)',
        'nav':   '0 2px 20px rgba(60,40,20,0.08)',
      },
      animation: {
        'fade-up':     'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':     'fadeIn 0.4s ease both',
        'scale-in':    'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-dot':   'pulseDot 2s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'blob':        'blob 8s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:     { from:{opacity:'0',transform:'translateY(20px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        fadeIn:     { from:{opacity:'0'}, to:{opacity:'1'} },
        scaleIn:    { from:{opacity:'0',transform:'scale(0.94)'}, to:{opacity:'1',transform:'scale(1)'} },
        slideRight: { from:{opacity:'0',transform:'translateX(-16px)'}, to:{opacity:'1',transform:'translateX(0)'} },
        pulseDot:   { '0%,100%':{opacity:'1',transform:'scale(1)'}, '50%':{opacity:'0.5',transform:'scale(0.8)'} },
        float:      { '0%,100%':{transform:'translateY(0px)'}, '50%':{transform:'translateY(-10px)'} },
        blob:       { '0%,100%':{borderRadius:'60% 40% 30% 70% / 60% 30% 70% 40%'}, '50%':{borderRadius:'30% 60% 70% 40% / 50% 60% 30% 60%'} },
      },
      transitionTimingFunction: { spring:'cubic-bezier(0.16,1,0.3,1)' },
    },
  },
  plugins: [],
}
