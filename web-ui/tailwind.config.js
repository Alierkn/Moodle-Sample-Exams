/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'], // Support both class and data attribute
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover styles when hover is supported
  },
  theme: {
    extend: {
      // Enhanced Color System
      colors: {
        // Primary Brand Colors
        primary: {
          50: 'rgb(240 249 255)',
          100: 'rgb(224 242 254)',
          200: 'rgb(186 230 253)',
          300: 'rgb(125 211 252)',
          400: 'rgb(56 189 248)',
          500: 'rgb(14 165 233)',
          600: 'rgb(2 132 199)',
          700: 'rgb(3 105 161)',
          800: 'rgb(7 89 133)',
          900: 'rgb(12 74 110)',
          950: 'rgb(8 47 73)',
        },
        // Secondary Brand Colors
        secondary: {
          50: 'rgb(250 245 255)',
          100: 'rgb(243 232 255)',
          200: 'rgb(233 213 255)',
          300: 'rgb(216 180 254)',
          400: 'rgb(196 141 253)',
          500: 'rgb(168 85 247)',
          600: 'rgb(147 51 234)',
          700: 'rgb(126 34 206)',
          800: 'rgb(107 33 168)',
          900: 'rgb(88 28 135)',
          950: 'rgb(59 7 100)',
        },
        // Accent Colors
        accent: {
          50: 'rgb(236 254 255)',
          100: 'rgb(207 250 254)',
          200: 'rgb(165 243 252)',
          300: 'rgb(103 232 249)',
          400: 'rgb(34 211 238)',
          500: 'rgb(6 182 212)',
          600: 'rgb(8 145 178)',
          700: 'rgb(14 116 144)',
          800: 'rgb(21 94 117)',
          900: 'rgb(22 78 99)',
          950: 'rgb(8 51 68)',
        },
        // Semantic Colors
        success: {
          50: 'rgb(236 253 245)',
          100: 'rgb(209 250 229)',
          200: 'rgb(167 243 208)',
          300: 'rgb(110 231 183)',
          400: 'rgb(52 211 153)',
          500: 'rgb(16 185 129)',
          600: 'rgb(5 150 105)',
          700: 'rgb(4 120 87)',
          800: 'rgb(6 95 70)',
          900: 'rgb(6 78 59)',
          950: 'rgb(2 44 34)',
        },
        warning: {
          50: 'rgb(255 251 235)',
          100: 'rgb(254 243 199)',
          200: 'rgb(253 230 138)',
          300: 'rgb(252 211 77)',
          400: 'rgb(251 191 36)',
          500: 'rgb(245 158 11)',
          600: 'rgb(217 119 6)',
          700: 'rgb(180 83 9)',
          800: 'rgb(146 64 14)',
          900: 'rgb(120 53 15)',
          950: 'rgb(69 26 3)',
        },
        error: {
          50: 'rgb(254 242 242)',
          100: 'rgb(254 226 226)',
          200: 'rgb(254 202 202)',
          300: 'rgb(252 165 165)',
          400: 'rgb(248 113 113)',
          500: 'rgb(239 68 68)',
          600: 'rgb(220 38 38)',
          700: 'rgb(185 28 28)',
          800: 'rgb(153 27 27)',
          900: 'rgb(127 29 29)',
          950: 'rgb(69 10 10)',
        },
        // Glass/Surface Colors
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          black: 'rgba(0, 0, 0, 0.1)',
          light: 'rgba(255, 255, 255, 0.05)',
          dark: 'rgba(0, 0, 0, 0.05)',
        },
      },
      
      // Enhanced Typography
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        mono: [
          '"SF Mono"',
          'Monaco',
          'Inconsolata',
          '"Roboto Mono"',
          '"Source Code Pro"',
          'Menlo',
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
        display: [
          '"Inter"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Responsive text sizes
        'responsive-xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'responsive-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'responsive-base': 'clamp(1rem, 3vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 4vw, 1.5rem)',
        'responsive-xl': 'clamp(1.25rem, 5vw, 2rem)',
        'responsive-2xl': 'clamp(1.5rem, 6vw, 3rem)',
      },
      
      // Enhanced Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Enhanced Border Radius
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      
      // Enhanced Box Shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
        // Custom glow shadows
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.3)',
        'glow-md': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.5)',
        'glow-xl': '0 0 50px rgba(59, 130, 246, 0.6)',
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-secondary': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.4)',
      },
      
      // Enhanced Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      
      // Enhanced Gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(147 51 234) 100%)',
        'gradient-secondary': 'linear-gradient(135deg, rgb(236 72 153) 0%, rgb(239 68 68) 100%)',
        'gradient-accent': 'linear-gradient(135deg, rgb(6 182 212) 0%, rgb(16 185 129) 100%)',
        'gradient-warm': 'linear-gradient(135deg, rgb(251 146 60) 0%, rgb(239 68 68) 100%)',
        'gradient-cool': 'linear-gradient(135deg, rgb(56 189 248) 0%, rgb(79 70 229) 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'gradient-glass-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      },
      
      // Enhanced Animations
      animation: {
        // Basic animations (enhanced)
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.6s ease-out',
        'fade-in-right': 'fadeInRight 0.6s ease-out',
        
        // Slide animations
        'slide-in': 'slideIn 0.4s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'slide-in-up': 'slideInUp 0.4s ease-out',
        'slide-in-down': 'slideInDown 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        
        // Scale animations
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'scale-in-bounce': 'scaleInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        
        // Bounce animations
        'bounce-in': 'bounceIn 0.6s ease-out',
        'bounce-in-up': 'bounceInUp 0.6s ease-out',
        'bounce-in-down': 'bounceInDown 0.6s ease-out',
        
        // Rotation animations
        'rotate-in': 'rotateIn 0.6s ease-out',
        'rotate-out': 'rotateOut 0.4s ease-in',
        
        // Floating animations
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 2s',
        'float-slow': 'float 10s ease-in-out infinite',
        
        // Pulse animations
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-fast': 'pulse 1s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        
        // Loading animations
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',
        'loading-dots': 'loadingDots 1.4s ease-in-out infinite both',
        'loading-bars': 'loadingBars 1.2s ease-in-out infinite',
        
        // Interactive animations
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
        'rubber-band': 'rubberBand 1s ease-in-out',
        
        // Background animations
        'gradient-x': 'gradientX 15s ease infinite',
        'gradient-y': 'gradientY 15s ease infinite',
        'gradient-xy': 'gradientXY 15s ease infinite',
        
        // Text animations
        'typing': 'typing 3.5s steps(40, end), blink-caret .75s step-end infinite',
        'text-shimmer': 'textShimmer 2s ease-in-out infinite alternate',
      },
      
      // Enhanced Keyframes
      keyframes: {
        // Basic fade animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        
        // Slide animations
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        
        // Scale animations
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        scaleInBounce: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
          '80%': { opacity: '1', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        
        // Bounce animations
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
          '70%': { opacity: '1', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceInUp: {
          '0%': { opacity: '0', transform: 'translateY(2000px)' },
          '60%': { opacity: '1', transform: 'translateY(-30px)' },
          '80%': { transform: 'translateY(10px)' },
          '100%': { transform: 'translateY(0)' },
        },
        bounceInDown: {
          '0%': { opacity: '0', transform: 'translateY(-2000px)' },
          '60%': { opacity: '1', transform: 'translateY(30px)' },
          '80%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' },
        },
        
        // Rotation animations
        rotateIn: {
          '0%': { opacity: '0', transform: 'rotate(-200deg)' },
          '100%': { opacity: '1', transform: 'rotate(0)' },
        },
        rotateOut: {
          '0%': { opacity: '1', transform: 'rotate(0)' },
          '100%': { opacity: '0', transform: 'rotate(200deg)' },
        },
        
        // Floating animation
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(2deg)' },
          '66%': { transform: 'translateY(10px) rotate(-2deg)' },
        },
        
        // Glow pulse
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(59, 130, 246, 0.4), 0 0 10px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)' 
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.4)' 
          },
        },
        
        // Loading animations
        loadingDots: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        loadingBars: {
          '0%, 40%, 100%': { transform: 'scaleY(0.4)' },
          '20%': { transform: 'scaleY(1.0)' },
        },
        
        // Interactive animations
        wiggle: {
          '0%, 7%': { transform: 'rotateZ(0)' },
          '15%': { transform: 'rotateZ(-15deg)' },
          '20%': { transform: 'rotateZ(10deg)' },
          '25%': { transform: 'rotateZ(-10deg)' },
          '30%': { transform: 'rotateZ(6deg)' },
          '35%': { transform: 'rotateZ(-4deg)' },
          '40%, 100%': { transform: 'rotateZ(0)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        rubberBand: {
          '0%': { transform: 'scale3d(1, 1, 1)' },
          '30%': { transform: 'scale3d(1.25, 0.75, 1)' },
          '40%': { transform: 'scale3d(0.75, 1.25, 1)' },
          '50%': { transform: 'scale3d(1.15, 0.85, 1)' },
          '65%': { transform: 'scale3d(0.95, 1.05, 1)' },
          '75%': { transform: 'scale3d(1.05, 0.95, 1)' },
          '100%': { transform: 'scale3d(1, 1, 1)' },
        },
        
        // Gradient animations
        gradientX: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        gradientY: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'center top' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'center bottom' },
        },
        gradientXY: {
          '0%, 100%': { 'background-size': '400% 400%', 'background-position': 'left center' },
          '50%': { 'background-size': '400% 400%', 'background-position': 'right center' },
        },
        
        // Text animations
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink-caret': {
          'from, to': { 'border-color': 'transparent' },
          '50%': { 'border-color': 'orange' },
        },
        textShimmer: {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '100% 50%' },
        },
      },
      
      // Enhanced Transitions
      transitionDelay: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
        '1500': '1500ms',
        '2000': '2000ms',
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // Enhanced Z-Index
      zIndex: {
        '-1': '-1',
        '0': '0',
        '1': '1',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'auto': 'auto',
        'tooltip': '1000',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'toast': '1070',
        'max': '2147483647',
      },
    },
  },
  plugins: [
    // Custom plugin for utilities
    function({ addUtilities, addComponents, theme }) {
      // Custom Glass Morphism Utilities
      addUtilities({
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-strong': {
          'background': 'rgba(255, 255, 255, 0.2)',
          'backdrop-filter': 'blur(40px) saturate(200%)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
        },
      });
      
      // Custom Interactive Components
      addComponents({
        '.btn': {
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'gap': '0.5rem',
          'padding': '0.75rem 1.5rem',
          'border-radius': '0.75rem',
          'font-weight': '600',
          'font-size': '0.875rem',
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          'cursor': 'pointer',
          'position': 'relative',
          'overflow': 'hidden',
          '&:focus': {
            'outline': 'none',
            'ring': '2px',
            'ring-color': theme('colors.primary.500'),
            'ring-offset': '2px',
          },
          '&:disabled': {
            'opacity': '0.5',
            'cursor': 'not-allowed',
          },
        },
        '.btn-primary': {
          'background': theme('backgroundImage.gradient-primary'),
          'color': 'white',
          'box-shadow': theme('boxShadow.lg'),
          '&:hover': {
            'transform': 'translateY(-1px) scale(1.02)',
            'box-shadow': theme('boxShadow.glow-primary'),
          },
          '&:active': {
            'transform': 'scale(0.98)',
          },
        },
        '.btn-secondary': {
          'background': theme('backgroundImage.gradient-secondary'),
          'color': 'white',
          'box-shadow': theme('boxShadow.lg'),
          '&:hover': {
            'transform': 'translateY(-1px) scale(1.02)',
            'box-shadow': theme('boxShadow.glow-secondary'),
          },
          '&:active': {
            'transform': 'scale(0.98)',
          },
        },
        '.btn-outline': {
          'background': 'transparent',
          'color': theme('colors.primary.600'),
          'border': `2px solid ${theme('colors.primary.500')}`,
          '&:hover': {
            'background': theme('colors.primary.500'),
            'color': 'white',
            'transform': 'translateY(-1px) scale(1.02)',
          },
        },
        '.btn-ghost': {
          'background': 'rgba(0, 0, 0, 0.05)',
          'color': theme('colors.gray.700'),
          'backdrop-filter': 'blur(10px)',
          '&:hover': {
            'background': 'rgba(0, 0, 0, 0.1)',
            'transform': 'translateY(-1px)',
          },
        },
      });
      
      // Custom Card Components
      addComponents({
        '.card': {
          'background': 'rgba(255, 255, 255, 0.8)',
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'border': `1px solid rgba(255, 255, 255, 0.2)`,
          'border-radius': theme('borderRadius.2xl'),
          'padding': theme('spacing.6'),
          'box-shadow': theme('boxShadow.xl'),
          'transition': 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          'position': 'relative',
          'overflow': 'hidden',
          '&:hover': {
            'transform': 'translateY(-4px) scale(1.01)',
            'box-shadow': `${theme('boxShadow.2xl')}, ${theme('boxShadow.glow-primary')}`,
          },
        },
        '.card-premium': {
          'background': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'border': `1px solid rgba(59, 130, 246, 0.2)`,
          'border-radius': theme('borderRadius.2xl'),
          'padding': theme('spacing.6'),
          'box-shadow': theme('boxShadow.xl'),
          'transition': 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            'transform': 'translateY(-4px) scale(1.01)',
            'box-shadow': `${theme('boxShadow.2xl')}, ${theme('boxShadow.glow-primary')}`,
            'border-color': 'rgba(59, 130, 246, 0.4)',
          },
        },
      });
      
      // Custom Form Components
      addComponents({
        '.input': {
          'width': '100%',
          'padding': '0.75rem 1rem',
          'border-radius': theme('borderRadius.xl'),
          'border': `2px solid ${theme('colors.gray.300')}`,
          'background': 'rgba(255, 255, 255, 0.5)',
          'backdrop-filter': 'blur(10px)',
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          'color': theme('colors.gray.900'),
          '&::placeholder': {
            'color': theme('colors.gray.500'),
          },
          '&:focus': {
            'outline': 'none',
            'border-color': theme('colors.primary.500'),
            'box-shadow': `0 0 0 3px rgba(59, 130, 246, 0.2)`,
            'transform': 'scale(1.01)',
          },
          '&:hover': {
            'border-color': theme('colors.gray.400'),
          },
        },
      });
      
      // Custom Navigation Components
      addComponents({
        '.nav-link': {
          'position': 'relative',
          'padding': '0.5rem 1rem',
          'border-radius': theme('borderRadius.lg'),
          'font-weight': '500',
          'color': theme('colors.gray.700'),
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          'overflow': 'hidden',
          '&::before': {
            'content': '""',
            'position': 'absolute',
            'bottom': '0',
            'left': '50%',
            'width': '0',
            'height': '2px',
            'background': theme('backgroundImage.gradient-primary'),
            'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            'transform': 'translateX(-50%)',
          },
          '&:hover': {
            'color': theme('colors.primary.600'),
            '&::before': {
              'width': '100%',
            },
          },
          '&.active': {
            'color': theme('colors.primary.600'),
            '&::before': {
              'width': '100%',
            },
          },
        },
      });
      
      // Custom Badge Components
      addComponents({
        '.badge': {
          'display': 'inline-flex',
          'align-items': 'center',
          'gap': '0.25rem',
          'padding': '0.25rem 0.75rem',
          'border-radius': theme('borderRadius.full'),
          'font-size': theme('fontSize.xs[0]'),
          'font-weight': '600',
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.badge-primary': {
          'background': 'rgba(59, 130, 246, 0.1)',
          'color': theme('colors.primary.700'),
          'border': `1px solid rgba(59, 130, 246, 0.2)`,
        },
        '.badge-success': {
          'background': 'rgba(16, 185, 129, 0.1)',
          'color': theme('colors.success.700'),
          'border': `1px solid rgba(16, 185, 129, 0.2)`,
        },
        '.badge-warning': {
          'background': 'rgba(245, 158, 11, 0.1)',
          'color': theme('colors.warning.700'),
          'border': `1px solid rgba(245, 158, 11, 0.2)`,
        },
        '.badge-error': {
          'background': 'rgba(239, 68, 68, 0.1)',
          'color': theme('colors.error.700'),
          'border': `1px solid rgba(239, 68, 68, 0.2)`,
        },
      });
      
      // Custom Loading Components
      addComponents({
        '.spinner': {
          'width': '1.5rem',
          'height': '1.5rem',
          'border': `2px solid ${theme('colors.gray.300')}`,
          'border-top': `2px solid ${theme('colors.primary.500')}`,
          'border-radius': '50%',
          'animation': 'spin 1s linear infinite',
        },
        '.skeleton': {
          'background': theme('colors.gray.200'),
          'border-radius': theme('borderRadius.md'),
          'animation': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
      });
      
      // Custom Text Effects
      addUtilities({
        '.text-gradient': {
          'background': theme('backgroundImage.gradient-primary'),
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-secondary': {
          'background': theme('backgroundImage.gradient-secondary'),
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-accent': {
          'background': theme('backgroundImage.gradient-accent'),
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-shimmer': {
          'background': 'linear-gradient(90deg, #000 0%, #fff 50%, #000 100%)',
          'background-size': '200% 100%',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          'animation': 'textShimmer 2s ease-in-out infinite alternate',
        },
      });
      
      // Custom Interactive Utilities
      addUtilities({
        '.interactive': {
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          'cursor': 'pointer',
          '&:hover': {
            'transform': 'translateY(-1px) scale(1.02)',
          },
          '&:active': {
            'transform': 'scale(0.98)',
          },
        },
        '.hover-lift': {
          'transition': 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            'transform': 'translateY(-2px)',
          },
        },
        '.hover-glow': {
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            'box-shadow': theme('boxShadow.glow-primary'),
            'filter': 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))',
          },
        },
        '.hover-scale': {
          'transition': 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            'transform': 'scale(1.05)',
          },
        },
        '.hover-rotate': {
          'transition': 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            'transform': 'rotate(5deg)',
          },
        },
      });
      
      // Custom Layout Utilities
      addUtilities({
        '.flex-center': {
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.flex-between': {
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
        },
        '.flex-around': {
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'space-around',
        },
        '.flex-evenly': {
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'space-evenly',
        },
        '.absolute-center': {
          'position': 'absolute',
          'top': '50%',
          'left': '50%',
          'transform': 'translate(-50%, -50%)',
        },
        '.fixed-center': {
          'position': 'fixed',
          'top': '50%',
          'left': '50%',
          'transform': 'translate(-50%, -50%)',
        },
      });
      
      // Custom Scroll Utilities
      addUtilities({
        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
        },
        '.scroll-auto': {
          'scroll-behavior': 'auto',
        },
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            'display': 'none',
          },
        },
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            'width': '8px',
            'height': '8px',
          },
          '&::-webkit-scrollbar-track': {
            'background': theme('colors.gray.100'),
            'border-radius': theme('borderRadius.full'),
          },
          '&::-webkit-scrollbar-thumb': {
            'background': theme('colors.gray.300'),
            'border-radius': theme('borderRadius.full'),
            '&:hover': {
              'background': theme('colors.gray.400'),
            },
          },
        },
      });
    },
    
    // Responsive Design Helper Plugin
    function({ addUtilities, theme }) {
      const responsiveUtilities = {};
      
      // Generate responsive text utilities
      Object.entries(theme('fontSize')).forEach(([key, value]) => {
        if (key.startsWith('responsive-')) {
          responsiveUtilities[`.text-${key}`] = {
            'font-size': Array.isArray(value) ? value[0] : value,
            'line-height': Array.isArray(value) && value[1] ? value[1].lineHeight : '1.5',
          };
        }
      });
      
      addUtilities(responsiveUtilities);
    },
    
    // Animation Delay Plugin
    function({ addUtilities, theme }) {
      const delays = theme('transitionDelay');
      const delayUtilities = {};
      
      Object.entries(delays).forEach(([key, value]) => {
        delayUtilities[`.animate-delay-${key}`] = {
          'animation-delay': value,
        };
      });
      
      addUtilities(delayUtilities);
    },
    
    // Print Utilities Plugin
    function({ addUtilities }) {
      addUtilities({
        '@media print': {
          '.print\\:hidden': {
            'display': 'none !important',
          },
          '.print\\:block': {
            'display': 'block !important',
          },
          '.print\\:inline': {
            'display': 'inline !important',
          },
          '.print\\:flex': {
            'display': 'flex !important',
          },
          '.print\\:text-black': {
            'color': '#000 !important',
          },
          '.print\\:bg-white': {
            'background-color': '#fff !important',
          },
          '.print\\:shadow-none': {
            'box-shadow': 'none !important',
          },
        },
      });
    },
  ],
  
  // Safelist for dynamic classes
  safelist: [
    'animate-fade-in',
    'animate-slide-in',
    'animate-bounce-in',
    'animate-scale-in',
    'animate-glow-pulse',
    'text-gradient',
    'glass',
    'glass-dark',
    'hover-glow',
    'interactive',
    {
      pattern: /^(animate-delay-|text-responsive-|shadow-glow-)/,
    },
  ],
}