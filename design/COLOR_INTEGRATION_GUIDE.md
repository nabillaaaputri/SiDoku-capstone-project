# Design System & Color Palette Integration Guide

Panduan untuk mengintegrasikan color palette dan design system ke SiDoku application.

## 🎨 Color Palette Management

### 1. Color Palette File Structure

Color palette disimpan di: `design/color-palette.json`

Saat ini adalah **PLACEHOLDER** dengan warna default. Setelah design final ditentukan:

```bash
# Update file ini dengan warna final
design/color-palette.json
```

### 2. Integration dengan Frontend (Tailwind CSS)

#### Cara 1: Manual Update `tailwind.config.js`

Edit `frontend/tailwind.config.js` dan masukkan color palette:

```javascript
// tailwind.config.js
import colors from '../../../design/color-palette.json'

export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          light: colors.primary.light,
          main: colors.primary.main,
          dark: colors.primary.dark,
        },
        // Secondary Colors
        secondary: {
          light: colors.secondary.light,
          main: colors.secondary.main,
          dark: colors.secondary.dark,
        },
        // Status Colors
        success: colors.success.main,
        warning: colors.warning.main,
        error: colors.error.main,
        info: colors.info.main,
        // Neutral Colors
        neutral: colors.neutral,
      },
      backgroundImage: {
        'gradient-primary': colors.gradients.primary,
        'gradient-success': colors.gradients.success,
        'gradient-warning': colors.gradients.warning,
        'gradient-error': colors.gradients.error,
      },
      boxShadow: {
        sm: colors.shadows.sm,
        md: colors.shadows.md,
        lg: colors.shadows.lg,
        xl: colors.shadows.xl,
      }
    },
  },
  plugins: [],
}
```

#### Cara 2: CSS Variables (Alternative)

Jika ingin lebih fleksibel, gunakan CSS variables:

Buat file `frontend/src/styles/colors.css`:

```css
:root {
  /* Primary Colors */
  --color-primary-light: #E8F5E9;
  --color-primary-main: #4CAF50;
  --color-primary-dark: #388E3C;
  
  /* Secondary Colors */
  --color-secondary-light: #E0F2F1;
  --color-secondary-main: #009688;
  --color-secondary-dark: #00695C;
  
  /* Status Colors */
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;
  
  /* Neutral Colors */
  --color-neutral-50: #FAFAFA;
  --color-neutral-100: #F5F5F5;
  --color-neutral-200: #EEEEEE;
  --color-neutral-300: #E0E0E0;
  --color-neutral-400: #BDBDBD;
  --color-neutral-500: #9E9E9E;
  --color-neutral-600: #757575;
  --color-neutral-700: #616161;
  --color-neutral-800: #424242;
  --color-neutral-900: #212121;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #4CAF50 0%, #009688 100%);
  --gradient-success: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
  --gradient-warning: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
  --gradient-error: linear-gradient(135deg, #F44336 0%, #EF5350 100%);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

Kemudian import di `App.jsx` atau `main.jsx`:

```javascript
import './styles/colors.css'
```

Dan gunakan di component:

```jsx
// Component
<div className="bg-[var(--color-primary-main)] text-white">
  {/* content */}
</div>
```

### 3. Using Colors in Components

#### Using Tailwind Classes

```jsx
// src/components/Dashboard/SummaryCards.jsx

export const SummaryCard = ({ title, value, icon, type }) => {
  const colorClasses = {
    income: 'bg-green-100 text-green-800 border-l-4 border-green-500',
    expense: 'bg-red-100 text-red-800 border-l-4 border-red-500',
    profit: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
  }

  return (
    <div className={`p-6 rounded-lg shadow-md ${colorClasses[type]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${type === 'income' ? 'bg-green-500' : type === 'expense' ? 'bg-red-500' : 'bg-blue-500'} bg-opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
```

#### Using CSS Variables

```jsx
export const CustomButton = ({ variant = 'primary', children }) => {
  const styles = {
    primary: {
      backgroundColor: 'var(--color-primary-main)',
      color: 'white'
    },
    secondary: {
      backgroundColor: 'var(--color-secondary-main)',
      color: 'white'
    },
    success: {
      backgroundColor: 'var(--color-success)',
      color: 'white'
    }
  }

  return (
    <button style={styles[variant]} className="px-4 py-2 rounded">
      {children}
    </button>
  )
}
```

## 🎨 Design System Components

### Typography Scale

```javascript
// tailwind.config.js
theme: {
  fontSize: {
    'xs': ['12px', { lineHeight: '16px' }],
    'sm': ['14px', { lineHeight: '20px' }],
    'base': ['16px', { lineHeight: '24px' }],
    'lg': ['18px', { lineHeight: '28px' }],
    'xl': ['20px', { lineHeight: '28px' }],
    '2xl': ['24px', { lineHeight: '32px' }],
    '3xl': ['30px', { lineHeight: '36px' }],
  }
}
```

### Spacing Scale

```javascript
// tailwind.config.js
theme: {
  spacing: {
    '0': '0',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
  }
}
```

### Border Radius

```javascript
// tailwind.config.js
theme: {
  borderRadius: {
    'none': '0',
    'sm': '2px',
    'base': '4px',
    'md': '8px',
    'lg': '12px',
    'xl': '16px',
    'full': '9999px',
  }
}
```

## 📱 Responsive Design

### Breakpoints

```javascript
// tailwind.config.js
theme: {
  screens: {
    'xs': '320px',   // Mobile
    'sm': '640px',   // Tablet
    'md': '768px',   // Small Laptop
    'lg': '1024px',  // Desktop
    'xl': '1280px',  // Large Desktop
    '2xl': '1536px', // Extra Large
  }
}
```

### Usage

```jsx
// Component dengan responsive design
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

## 🌓 Dark Mode Support (Optional)

Jika ingin support dark mode, update `tailwind.config.js`:

```javascript
export default {
  darkMode: 'class', // atau 'media'
  theme: {
    extend: {
      colors: {
        // Light mode
        light: {
          bg: '#FFFFFF',
          text: '#212121',
        },
        // Dark mode
        dark: {
          bg: '#121212',
          text: '#FFFFFF',
        }
      }
    }
  }
}
```

Usage:

```jsx
<div className="bg-white dark:bg-slate-900 text-black dark:text-white">
  {/* Content */}
</div>
```

## 📊 Design Token Documentation

Buat file `design/DESIGN_TOKENS.md`:

```markdown
# Design Tokens - SiDoku

## Colors

### Primary (Green - Growth & Trust)
- Light: #E8F5E9
- Main: #4CAF50
- Dark: #388E3C

### Secondary (Teal - Balance)
- Light: #E0F2F1
- Main: #009688
- Dark: #00695C

### Status Colors
- Success (Green): #4CAF50
- Warning (Orange): #FF9800
- Error (Red): #F44336
- Info (Blue): #2196F3

### Neutral Scale
- 50: #FAFAFA (very light)
- 900: #212121 (very dark)

## Typography

- Heading 1: 30px, Bold, Line: 36px
- Heading 2: 24px, Bold, Line: 32px
- Heading 3: 20px, Bold, Line: 28px
- Body: 16px, Regular, Line: 24px
- Small: 14px, Regular, Line: 20px

## Spacing

Base unit: 4px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## Shadows

- Subtle (cards): 0 1px 2px rgba(0,0,0,0.05)
- Default (modals): 0 4px 6px rgba(0,0,0,0.1)
- Emphasis (hover): 0 10px 15px rgba(0,0,0,0.1)

## Border Radius

- Small: 2px
- Default: 4px
- Medium: 8px
- Large: 12px
- Pill: 999px
```

## ✅ Color Palette Update Checklist

Ketika final color palette sudah ditentukan:

- [ ] Update `design/color-palette.json` dengan warna final
- [ ] Update `frontend/tailwind.config.js` dengan color mapping
- [ ] Update `frontend/src/styles/colors.css` jika menggunakan CSS variables
- [ ] Review semua components dengan warna baru
- [ ] Test responsive design di berbagai screen sizes
- [ ] Test dark mode (jika implemented)
- [ ] Update `design/DESIGN_TOKENS.md` dengan dokumentasi final
- [ ] Commit changes ke GitHub dengan message: "feat: finalize color palette"
- [ ] Notify team tentang color changes

## 🔄 Workflow untuk Update Warna

1. Designer menentukan final palette
2. Update `design/color-palette.json`
3. Run: `npm run tailwind:build` (jika menggunakan script)
4. Review di staging
5. Commit dan push ke main
6. Vercel auto-deploys dengan warna baru

## 📚 Resources

- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Tailwind CSS Theme Customization](https://tailwindcss.com/docs/theme)
- [CSS Variables Best Practices](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Web Design Color Theory](https://www.interaction-design.org/literature/article/color-theory-and-the-60-30-10-rule)
