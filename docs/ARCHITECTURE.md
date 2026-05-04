# System Architecture - SiDoku

Gambaran lengkap arsitektur sistem SiDoku dari perspektif teknologi dan aliran data.

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE (Browser)                       │
│                   React.js + Tailwind CSS                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    UI Components                           │ │
│  │  - Landing Page  - Dashboard   - Transactions  - Reports   │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────┬─────────────────────────────────────────────────┘
                 │ HTTP/REST + WebSocket
                 │ (Axios for requests)
┌────────────────▼─────────────────────────────────────────────────┐
│                     API GATEWAY / BACKEND                        │
│                    Express.js + Node.js                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           API Routes & Controllers                         │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Auth │ Products │ Transactions │ Reports │ Dashboard │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │          Middleware & Utilities                      │ │ │
│  │  │  Auth (JWT) │ Error Handling │ CORS │ Validation    │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└──┬─────────────────────────────────────┬──────────────────────────┘
   │                                      │
   │ SQL Queries                          │ HTTP to AI Service
   │                                      │
┌──▼──────────────────────┐    ┌──────────▼──────────────────────┐
│   Database Layer        │    │   AI Service Layer              │
│   PostgreSQL 14         │    │   FastAPI + Python              │
│  ┌────────────────────┐ │    │  ┌──────────────────────────┐   │
│  │ Users              │ │    │  │ Transaction Classifier   │   │
│  │ Products           │ │    │  │ (Scikit-learn)           │   │
│  │ Transactions       │ │    │  │                          │   │
│  │ Reports            │ │    │  │ Sales Forecasting        │   │
│  │ Insights Data      │ │    │  │ (TensorFlow/LSTM)        │   │
│  └────────────────────┘ │    │  │                          │   │
│                         │    │  │ Business Insights        │   │
└─────────────────────────┘    │  │ (Data Analysis)          │   │
                               │  └──────────────────────────┘   │
                               └─────────────────────────────────┘
```

## 🏗️ Component Architecture

### 1. Frontend Layer (React.js)

```
Frontend/
├── public/
│   └── assets/          # Images, icons, static files
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Cards/
│   │   ├── Charts/
│   │   └── Forms/
│   │
│   ├── pages/           # Page components (route pages)
│   │   ├── LandingPage/
│   │   ├── LoginPage/
│   │   ├── DashboardPage/
│   │   ├── ProductsPage/
│   │   ├── TransactionsPage/
│   │   ├── ReportsPage/
│   │   └── InsightsPage/
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth/
│   │   ├── useFetch/
│   │   └── useLocalStorage/
│   │
│   ├── context/         # Context API for state
│   │   ├── AuthContext/
│   │   ├── DashboardContext/
│   │   └── TransactionContext/
│   │
│   ├── services/        # API services
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── transactionService.js
│   │   ├── reportService.js
│   │   └── aiService.js
│   │
│   ├── styles/          # Global & shared styles
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   ├── utils/           # Utility functions
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   │
│   └── App.jsx          # Main app component
```

### 2. Backend Layer (Express.js)

```
Backend/
├── src/
│   ├── routes/          # API route definitions
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── transactions.js
│   │   ├── reports.js
│   │   ├── dashboard.js
│   │   └── ai.js
│   │
│   ├── controllers/      # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── transactionController.js
│   │   ├── reportController.js
│   │   ├── dashboardController.js
│   │   └── aiController.js
│   │
│   ├── models/          # Database models/queries
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Transaction.js
│   │   └── Report.js
│   │
│   ├── middleware/      # Express middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validators.js
│   │
│   ├── utils/           # Utility functions
│   │   ├── jwt.js
│   │   ├── database.js
│   │   └── helpers.js
│   │
│   ├── config/          # Configuration files
│   │   ├── database.js
│   │   └── env.js
│   │
│   └── app.js           # Express app setup
│
└── migrations/          # Database migrations (if using migration tool)
```

### 3. AI Service Layer (FastAPI)

```
AI-Service/
├── app/
│   ├── routes/          # API endpoints
│   │   ├── classify.py
│   │   ├── forecast.py
│   │   ├── insights.py
│   │   └── recommend.py
│   │
│   ├── models/          # ML models & inference
│   │   ├── classifier.py    # Transaction classification
│   │   ├── forecaster.py    # Sales forecasting
│   │   └── analyzer.py      # Business analysis
│   │
│   ├── schemas/         # Request/response schemas
│   │   ├── transaction.py
│   │   ├── forecast.py
│   │   └── insight.py
│   │
│   ├── services/        # Business logic
│   │   ├── classification.py
│   │   ├── prediction.py
│   │   └── analysis.py
│   │
│   └── config.py
│
├── notebooks/           # Jupyter notebooks
│   ├── data_exploration.ipynb
│   ├── model_training.ipynb
│   └── evaluation.ipynb
│
├── data/               # Training/test data
│   ├── raw/
│   ├── processed/
│   └── external/
│
└── main.py             # App entry point
```

## 📡 Data Flow

### User Registration & Login Flow
```
User Input → Frontend Form → Backend Auth API → Database
                                    ↓
                            Validate & Hash Password
                                    ↓
                            Create User Record
                                    ↓
                            Generate JWT Token
                                    ↓
                            Return Token to Frontend
                                    ↓
                            Store Token (localStorage)
```

### Transaction Recording Flow
```
User Input → Frontend Form → Backend API → AI Service (Classify) → Database
                                             ↓
                                    Categorize Transaction
                                             ↓
                                    Return Category
                                    ↓
                            Save to Database
                                    ↓
                            Update Dashboard Cache
                                    ↓
                            Return Confirmation
```

### Dashboard Update Flow
```
Frontend Load → Request Dashboard Data → Backend API
                                            ↓
                                    Query Database
                                    (Transactions, Products, etc)
                                            ↓
                                    Aggregate Data
                                            ↓
                                    Return to Frontend
                                            ↓
                                    Render Charts & Cards
                                    (using Recharts)
```

## 🔐 Security Layers

```
┌─────────────────────────────────────┐
│  Frontend Layer                      │
│  - HTTPS only                        │
│  - Secure token storage (localStorage) │
│  - CORS validation                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  API Layer (Express.js)              │
│  - JWT authentication middleware    │
│  - Input validation & sanitization  │
│  - SQL injection prevention          │
│  - Rate limiting                     │
│  - CORS headers                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Database Layer (PostgreSQL)         │
│  - User passwords hashed (bcrypt)    │
│  - Row-level security                │
│  - Encrypted sensitive fields        │
└─────────────────────────────────────┘
```

## 🚀 Deployment Architecture

```
Git Repository (GitHub)
          ↓
    ┌─────┴────────┬──────────┐
    ↓              ↓          ↓
Frontend        Backend      AI Service
(Vercel)        (Railway)    (Railway)
    ↓              ↓          ↓
CDN          Cloud Server   Cloud Server
Global       (Node.js)      (Python)
Distribution └─────┬────────┘
              PostgreSQL
              (Cloud Database)
```

## 📊 Technology Decision Rationale

| Layer | Tech | Why? |
|-------|------|------|
| Frontend | React.js | Component reusability, large ecosystem |
| Styling | Tailwind CSS | Fast development, utility-first approach |
| Backend | Express.js | Lightweight, perfect for REST API |
| Database | PostgreSQL | Relational data, robust, free tier support |
| AI/ML | Python + FastAPI | Best ML libraries (TensorFlow, scikit-learn) |
| Hosting | Vercel/Railway | Free tier, easy CI/CD, good for learning |

## 🔄 Integration Points

1. **Frontend ↔ Backend**: REST API with Axios
2. **Backend ↔ AI Service**: HTTP requests to FastAPI
3. **Backend ↔ Database**: SQL queries via Node.js drivers
4. **Frontend ↔ Local Storage**: Auth tokens, user preferences
5. **CI/CD**: GitHub Actions → Vercel/Railway deployments
