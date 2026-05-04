# Setup Instructions - SiDoku Project

Panduan lengkap untuk setup dan menjalankan SiDoku di environment lokal.

## Prerequisites

Pastikan sudah install:
- **Node.js** 20.x LTS - [Download](https://nodejs.org/)
- **Python** 3.12.x - [Download](https://www.python.org/)
- **PostgreSQL** 14 - [Download](https://www.postgresql.org/)
- **Git** - [Download](https://git-scm.com/)
- **Visual Studio Code** (opsional tapi recommended)

## 1. Clone Repository

```bash
git clone https://github.com/your-team/sidoku.git
cd sidoku
```

## 2. Frontend Setup

### Install Dependencies
```bash
cd frontend
npm install
```

### Konfigurasi Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` dengan konfigurasi:
```env
VITE_API_URL=http://localhost:3001
VITE_AI_SERVICE_URL=http://localhost:8000
```

### Development Server
```bash
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

## 3. Backend Setup

### Install Dependencies
```bash
cd ../backend
npm install
```

### Konfigurasi Environment
```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/sidoku_db
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173
```

### Database Setup
```bash
# Create database
createdb sidoku_db

# Run migrations (jika sudah ada setup migrations)
npm run migrate
```

### Development Server
```bash
npm run dev
```

Backend API akan berjalan di: `http://localhost:3001`

## 4. AI Service Setup

### Create Virtual Environment
```bash
cd ../ai-service

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Konfigurasi Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
FASTAPI_ENV=development
API_PORT=8000
BACKEND_URL=http://localhost:3001
```

### Development Server
```bash
python main.py
```

AI Service akan berjalan di: `http://localhost:8000`

## 5. Verifikasi Setup

Buka browser dan test endpoints:

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:3001/api/health
3. **AI Service**: http://localhost:8000/docs (Swagger UI)

## 📋 Project Structure

```
sidoku/
├── frontend/          # React.js app
├── backend/           # Express.js API
├── ai-service/        # FastAPI service
├── design/            # Design assets
└── docs/              # Documentation
```

## 🔧 Common Commands

### Frontend
```bash
cd frontend
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Linting
```

### Backend
```bash
cd backend
npm run dev       # Development server
npm run build     # Production build
npm test          # Run tests
```

### AI Service
```bash
cd ai-service
uvicorn main:app --reload          # Development server
python -m pytest                   # Run tests
python notebooks/analysis.ipynb    # Jupyter notebook
```

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
# Windows: Services -> PostgreSQL
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Check connection
psql -U postgres -c "SELECT version();"
```

### Port Already in Use
```bash
# Find process using port
# Windows: netstat -ano | findstr :3001
# macOS/Linux: lsof -i :3001

# Kill process (get PID from above)
# Windows: taskkill /PID <PID> /F
# macOS/Linux: kill -9 <PID>
```

### Python Virtual Environment Issues
```bash
# Deactivate current venv
deactivate

# Remove and recreate venv
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## 📖 Next Steps

- Review [API Documentation](API.md)
- Check [Database Schema](DATABASE.md)
- Read [Architecture Guide](ARCHITECTURE.md)
- Check color palette: `design/color-palette.json`

## 💬 Questions?

Hubungi team lead atau check dokumentasi di folder `/docs`
