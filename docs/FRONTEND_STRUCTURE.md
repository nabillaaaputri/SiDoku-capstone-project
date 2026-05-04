# Frontend Folder Structure & Component Map

Dokumentasi lengkap struktur folder dan component naming conventions untuk frontend SiDoku.

## 📁 Folder Structure Detail

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── assets/              # Static assets
│       ├── images/
│       ├── icons/
│       └── illustrations/
│
├── src/
│   ├── components/
│   │   ├── Common/          # Shared components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Navigation.jsx
│   │   │
│   │   ├── Auth/            # Auth-related components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── Dashboard/       # Dashboard components
│   │   │   ├── SummaryCards.jsx
│   │   │   ├── SalesChart.jsx
│   │   │   ├── ExpenseChart.jsx
│   │   │   ├── TopProducts.jsx
│   │   │   └── LowStockAlert.jsx
│   │   │
│   │   ├── Products/        # Product management components
│   │   │   ├── ProductTable.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   └── ProductCard.jsx
│   │   │
│   │   ├── Transactions/    # Transaction components
│   │   │   ├── TransactionTable.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionFilter.jsx
│   │   │   └── IncomeForm.jsx
│   │   │
│   │   ├── Reports/         # Report components
│   │   │   ├── ProfitLossReport.jsx
│   │   │   ├── ProductPerformance.jsx
│   │   │   └── ReportFilters.jsx
│   │   │
│   │   └── UI/              # Reusable UI components
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Card.jsx
│   │       ├── Badge.jsx
│   │       ├── Alert.jsx
│   │       ├── Spinner.jsx
│   │       └── Pagination.jsx
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── TransactionsPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── InsightsPage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication hook
│   │   ├── useFetch.js      # Data fetching hook
│   │   ├── useForm.js       # Form handling hook
│   │   ├── useLocalStorage.js
│   │   └── useDebounce.js
│   │
│   ├── context/             # Context API state
│   │   ├── AuthContext.jsx
│   │   ├── DashboardContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── services/            # API service layer
│   │   ├── api.js           # Axios instance config
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── transactionService.js
│   │   ├── reportService.js
│   │   ├── dashboardService.js
│   │   └── aiService.js
│   │
│   ├── styles/
│   │   ├── index.css        # Global styles
│   │   ├── tailwind.css     # Tailwind directives
│   │   ├── animations.css
│   │   └── variables.css    # CSS variables (colors, spacing)
│   │
│   ├── utils/               # Utility functions
│   │   ├── formatters.js    # Date, number, currency formatting
│   │   ├── validators.js    # Form validation
│   │   ├── constants.js     # App constants
│   │   ├── api-error.js     # API error handler
│   │   └── helpers.js       # General helper functions
│   │
│   ├── config/
│   │   ├── routes.js        # Route configuration
│   │   └── api.js           # API configuration
│   │
│   ├── App.jsx              # Root app component
│   ├── index.jsx            # App entry point
│   └── main.jsx             # Vite entry point
│
├── .env.example
├── .eslintrc.json
├── tailwind.config.js
├── vite.config.js
├── package.json
├── package-lock.json
└── index.html
```

## 🎨 Component Naming Conventions

### File Naming
- **Components**: PascalCase (e.g., `ProductTable.jsx`)
- **Utilities**: camelCase (e.g., `formatDate.js`)
- **Styles**: kebab-case (e.g., `card-styles.css`)
- **Tests**: Same as component + `.test.js` (e.g., `ProductTable.test.jsx`)

### Component Structure Template

```jsx
// src/components/Products/ProductTable.jsx

import React, { useState, useEffect } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { Button } from '../UI/Button'
import { Spinner } from '../UI/Spinner'
import './ProductTable.css'

/**
 * ProductTable Component
 * Menampilkan daftar produk dalam bentuk tabel dengan fitur filter dan sort
 * 
 * @component
 * @example
 * <ProductTable onEdit={handleEdit} onDelete={handleDelete} />
 */
export const ProductTable = ({ onEdit, onDelete }) => {
  const [products, setProducts] = useState([])
  const { data, loading, error } = useFetch('/api/products')

  useEffect(() => {
    if (data) setProducts(data)
  }, [data])

  if (loading) return <Spinner />
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="product-table">
      {/* Component JSX */}
    </div>
  )
}

export default ProductTable
```

## 📦 Component Categories

### 1. Page Components (`/pages`)
- Top-level route components
- Handle routing and layout
- Connect multiple feature components

### 2. Feature Components (`/components/[Feature]`)
- Domain-specific components
- Manage feature state
- Contain multiple sub-components

### 3. UI Components (`/components/UI`)
- Reusable, presentation-only components
- No business logic
- Highly composable
- Examples: Button, Input, Card, Modal

### 4. Common Components (`/components/Common`)
- Shared across entire app
- Layout components
- Navigation components

## 🔄 Data Flow Pattern

```
Page Component
    ↓
useAuth / useFetch hook
    ↓
API Service (Axios)
    ↓
Backend API
    ↓
State Management (Context/Hook)
    ↓
Feature Components
    ↓
UI Components
```

## 📋 Common Component Props Pattern

```jsx
/**
 * Card Component - Reusable container
 * @param {string} title - Card title
 * @param {ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {boolean} loading - Loading state
 */
export const Card = ({ title, children, className = '', loading = false }) => {
  // Implementation
}
```

## 🎯 Best Practices

1. **Keep components small and focused** - Single Responsibility Principle
2. **Extract business logic to hooks** - Reusable custom hooks
3. **Use composition over inheritance** - Compose components together
4. **Prop drilling alternatives** - Use Context API for global state
5. **Lazy load heavy components** - Use React.lazy() for code splitting
6. **Memoize expensive renders** - Use React.memo() when needed

## 📚 Import Organization

```jsx
// 1. React & third-party
import React, { useState, useEffect } from 'react'
import axios from 'axios'

// 2. Custom hooks
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'

// 3. Components
import { Button } from '../UI/Button'
import { Card } from '../UI/Card'

// 4. Services
import { productService } from '../services/productService'

// 5. Utils & constants
import { formatCurrency } from '../utils/formatters'
import { API_ENDPOINTS } from '../utils/constants'

// 6. Styles
import './ProductTable.css'
```

## 🧪 Component Testing Pattern

```jsx
// ProductTable.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductTable } from './ProductTable'

describe('ProductTable Component', () => {
  test('renders product list', () => {
    render(<ProductTable />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  test('calls onEdit when edit button is clicked', () => {
    const handleEdit = jest.fn()
    render(<ProductTable onEdit={handleEdit} />)
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(handleEdit).toHaveBeenCalled()
  })
})
```
