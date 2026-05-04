# Backend Folder Structure & API Routes

Dokumentasi lengkap struktur folder backend dan API endpoints organization.

## 📁 Folder Structure

```
backend/
├── src/
│   ├── app.js                   # Express app setup & middleware
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── auth.js              # Auth routes
│   │   ├── products.js          # Product management routes
│   │   ├── transactions.js      # Transaction routes
│   │   ├── dashboard.js         # Dashboard routes
│   │   ├── reports.js           # Report routes
│   │   └── ai.js                # AI service routes
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   │   └── exports: register(), login(), logout(), refreshToken()
│   │   ├── productController.js
│   │   │   └── exports: getAll(), getById(), create(), update(), delete()
│   │   ├── transactionController.js
│   │   │   └── exports: recordIncome(), recordExpense(), getAll(), getById(), update(), delete()
│   │   ├── dashboardController.js
│   │   │   └── exports: getSummary(), getTrends(), getAlerts()
│   │   ├── reportController.js
│   │   │   └── exports: getProfitLoss(), getProductPerformance()
│   │   └── aiController.js
│   │       └── exports: classifyTransaction(), getInsights()
│   │
│   ├── models/
│   │   ├── User.js
│   │   │   └── methods: create(), findById(), findByEmail(), update(), delete()
│   │   ├── Product.js
│   │   │   └── methods: create(), findByUser(), findById(), update(), delete(), getLowStock()
│   │   ├── Transaction.js
│   │   │   └── methods: create(), findByUser(), findById(), update(), delete(), getByDateRange()
│   │   ├── Report.js
│   │   │   └── methods: generate(), save(), findByUser()
│   │   └── StockHistory.js
│   │       └── methods: logChange(), getHistory()
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── validation.js        # Input validation middleware
│   │   ├── cors.js              # CORS configuration
│   │   └── logging.js           # Request logging
│   │
│   ├── utils/
│   │   ├── jwt.js               # JWT token generation/verification
│   │   ├── database.js          # Database connection pool
│   │   ├── helpers.js           # Helper functions
│   │   ├── formatters.js        # Response formatting
│   │   └── validators.js        # Input validation schemas
│   │
│   ├── config/
│   │   ├── database.js          # Database config
│   │   ├── env.js               # Environment variables
│   │   ├── constants.js         # App constants
│   │   └── queries.sql          # Reusable SQL queries
│   │
│   └── services/
│       ├── authService.js       # Auth business logic
│       ├── productService.js    # Product business logic
│       ├── transactionService.js
│       ├── reportService.js
│       ├── dashboardService.js
│       └── aiService.js         # Communication with FastAPI
│
├── tests/
│   ├── auth.test.js
│   ├── products.test.js
│   ├── transactions.test.js
│   └── api.test.js
│
├── migrations/                  # Database migrations (if using migration tool)
│   ├── 001_create_users.sql
│   ├── 002_create_products.sql
│   └── 003_create_transactions.sql
│
├── .env.example
├── .env                        # (Gitignored - local only)
├── .eslintrc.json
├── app.js                      # Server entry point
├── package.json
├── package-lock.json
└── README.md
```

## 📡 API Routes Structure

### Auth Routes
```
POST   /api/auth/register          → authController.register()
POST   /api/auth/login             → authController.login()
POST   /api/auth/logout            → authController.logout()
POST   /api/auth/refresh-token     → authController.refreshToken()
GET    /api/auth/me                → authController.getCurrentUser()
PUT    /api/auth/profile           → authController.updateProfile()
```

### Product Routes
```
GET    /api/products               → productController.getAll()
GET    /api/products/:id           → productController.getById()
POST   /api/products               → productController.create()
PUT    /api/products/:id           → productController.update()
DELETE /api/products/:id           → productController.delete()
GET    /api/products/low-stock     → productController.getLowStock()
POST   /api/products/bulk-update   → productController.bulkUpdate()
```

### Transaction Routes
```
GET    /api/transactions           → transactionController.getAll()
GET    /api/transactions/:id       → transactionController.getById()
POST   /api/transactions/income    → transactionController.recordIncome()
POST   /api/transactions/expense   → transactionController.recordExpense()
PUT    /api/transactions/:id       → transactionController.update()
DELETE /api/transactions/:id       → transactionController.delete()
GET    /api/transactions/summary   → transactionController.getSummary()
```

### Dashboard Routes
```
GET    /api/dashboard/summary      → dashboardController.getSummary()
GET    /api/dashboard/trends       → dashboardController.getTrends()
GET    /api/dashboard/alerts       → dashboardController.getAlerts()
GET    /api/dashboard/overview     → dashboardController.getOverview()
```

### Report Routes
```
GET    /api/reports/profit-loss    → reportController.getProfitLoss()
GET    /api/reports/product-perf   → reportController.getProductPerformance()
GET    /api/reports/cash-flow      → reportController.getCashFlow()
POST   /api/reports/export         → reportController.exportReport()
```

### AI Service Routes
```
POST   /api/ai/classify            → aiController.classifyTransaction()
GET    /api/ai/insights            → aiController.getInsights()
POST   /api/ai/predict             → aiController.predictSales()
GET    /api/ai/recommendations     → aiController.getRecommendations()
```

### Health Check
```
GET    /api/health                 → Return server status
GET    /health                     → Simple health check
```

## 🔌 Controller Pattern

### Example: productController.js

```javascript
// src/controllers/productController.js

import { Product } from '../models/Product.js'
import { validateProduct } from '../utils/validators.js'
import { formatResponse, handleError } from '../utils/formatters.js'

/**
 * Get all products for authenticated user
 * @route GET /api/products
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const userId = req.user.id

    const products = await Product.findByUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      search
    })

    return formatResponse(res, 200, 'Products fetched successfully', {
      data: products.data,
      pagination: products.pagination
    })
  } catch (error) {
    return handleError(res, error)
  }
}

/**
 * Create new product
 * @route POST /api/products
 */
export const create = async (req, res) => {
  try {
    const { error, value } = validateProduct(req.body)
    if (error) {
      return formatResponse(res, 400, error.message, null)
    }

    const product = await Product.create({
      ...value,
      user_id: req.user.id
    })

    return formatResponse(res, 201, 'Product created successfully', product)
  } catch (error) {
    return handleError(res, error)
  }
}

// ... more methods
```

## 🔐 Middleware Implementation

### Auth Middleware
```javascript
// src/middleware/auth.js

import { verifyToken } from '../utils/jwt.js'

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' })
    }

    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

### Error Handler
```javascript
// src/middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error(err)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
}
```

## 📦 Service Layer Pattern

### Example: transactionService.js

```javascript
// src/services/transactionService.js

import { Transaction } from '../models/Transaction.js'
import { aiService } from './aiService.js'
import { updateStockHistory } from '../models/StockHistory.js'

export const recordIncomeTransaction = async (userId, data) => {
  // 1. Validate input
  // 2. Classify transaction with AI
  const classification = await aiService.classify(data.description)
  
  // 3. Save transaction
  const transaction = await Transaction.create({
    user_id: userId,
    type: 'income',
    category: classification.category,
    ...data
  })

  // 4. Update product stock if applicable
  if (data.product_id) {
    await updateStockHistory(data.product_id, data.quantity, 'sale')
  }

  return transaction
}
```

## 🗄️ Database Connection Pattern

### src/utils/database.js
```javascript
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

export const query = (text, params) => pool.query(text, params)

export const getConnection = () => pool.connect()

export default pool
```

## ✅ Testing Pattern

### Example test
```javascript
// tests/products.test.js

import request from 'supertest'
import app from '../src/app.js'

describe('Product Endpoints', () => {
  let token

  beforeAll(async () => {
    // Setup: login user
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password' })
    
    token = res.body.token
  })

  describe('GET /api/products', () => {
    it('should return list of products', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toBeInstanceOf(Array)
    })
  })

  describe('POST /api/products', () => {
    it('should create new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Product',
          cost_price: 10000,
          selling_price: 15000,
          current_stock: 100
        })

      expect(res.status).toBe(201)
      expect(res.body.product.id).toBeDefined()
    })
  })
})
```

## 🚀 Express App Setup

### src/app.js
```javascript
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import { authenticate } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app = express()

// Middleware
app.use(express.json())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}))

// Routes
app.use('/api/auth', routes.authRoutes)
app.use('/api/products', authenticate, routes.productRoutes)
app.use('/api/transactions', authenticate, routes.transactionRoutes)
app.use('/api/dashboard', authenticate, routes.dashboardRoutes)
app.use('/api/reports', authenticate, routes.reportRoutes)
app.use('/api/ai', authenticate, routes.aiRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'sidoku-backend' })
})

// Error handling
app.use(errorHandler)

export default app
```

## 📋 Best Practices

1. **Keep controllers thin** - Move logic to services
2. **Use middleware for cross-cutting concerns** - Auth, logging, validation
3. **Validate input at controller level** - Use Joi or similar
4. **Use services for business logic** - Database queries, calculations
5. **Error handling** - Consistent error responses
6. **Use transactions** - For multi-step operations
7. **Logging** - Log important operations and errors
8. **Documentation** - JSDoc comments for functions
