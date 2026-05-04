# Database Schema - SiDoku

Desain lengkap database PostgreSQL untuk SiDoku.

## 📊 Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     Users       │◄────┬───│    Products      │
├─────────────────┤     │   ├──────────────────┤
│ id (PK)         │     │   │ id (PK)          │
│ email (UNIQUE)  │     │   │ user_id (FK)     │
│ name            │     │   │ name             │
│ password_hash   │     │   │ cost_price       │
│ business_name   │     │   │ selling_price    │
│ created_at      │     │   │ current_stock    │
│ updated_at      │     │   │ created_at       │
└─────────────────┘     │   └──────────────────┘
         │              │
         └──────┬───────┘
                │
        ┌───────▼────────────┐
        │   Transactions     │
        ├────────────────────┤
        │ id (PK)            │
        │ user_id (FK)       │
        │ product_id (FK)    │
        │ type               │ ◄───┐
        │ amount             │     │
        │ category           │     │
        │ description        │     │
        │ date               │     │
        │ created_at         │     │
        └────────────────────┘     │
                                   │
                        ┌──────────┴─────────┐
                        │                    │
                  ┌─────▼──────┐    ┌──────▼──────┐
                  │  Reports   │    │   Insights  │
                  ├────────────┤    ├─────────────┤
                  │ id (PK)    │    │ id (PK)     │
                  │ user_id(FK)│    │ user_id(FK) │
                  │ type       │    │ type        │
                  │ data       │    │ summary     │
                  │ period     │    │ score       │
                  │ created_at │    │ created_at  │
                  └────────────┘    └─────────────┘
```

## 🗄️ Table Details

### 1. Users Table
Menyimpan data pengguna aplikasi

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  status VARCHAR(50) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);
```

**Columns:**
- `id`: Unique identifier (UUID)
- `email`: Email unik untuk login
- `name`: Nama pemilik usaha
- `password_hash`: Password yang di-hash (bcrypt)
- `business_name`: Nama usaha/toko
- `business_type`: Tipe usaha (toko kelontong, warung, dll)
- `status`: Status akun (active/inactive/suspended)

---

### 2. Products Table
Menyimpan data produk/item yang dijual

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  min_stock INT DEFAULT 5,
  unit VARCHAR(50),
  category VARCHAR(100),
  supplier VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_current_stock (current_stock)
);
```

**Columns:**
- `cost_price`: Harga modal/HPP
- `selling_price`: Harga jual
- `current_stock`: Jumlah stok terkini
- `min_stock`: Minimum stok warning
- `category`: Kategori produk

---

### 3. Transactions Table
Menyimpan semua transaksi keuangan (pemasukan & pengeluaran)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,  -- 'income' or 'expense'
  category VARCHAR(100),      -- 'sales', 'operational', 'capital', 'inventory'
  amount DECIMAL(12, 2) NOT NULL,
  quantity INT,               -- For income transactions
  description TEXT,
  date DATE NOT NULL,
  notes TEXT,
  ai_classification VARCHAR(100),  -- Auto-classified by AI
  attachment_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_user_id (user_id),
  INDEX idx_date (date),
  INDEX idx_type (type),
  INDEX idx_category (category),
  CHECK (type IN ('income', 'expense'))
);
```

**Columns:**
- `type`: Jenis transaksi (income/expense)
- `category`: Kategori detail
  - Income: `sales`
  - Expense: `operational`, `capital`, `inventory`
- `ai_classification`: Hasil klasifikasi AI otomatis
- `date`: Tanggal transaksi (bukan created_at)

---

### 4. Stock History Table
Riwayat perubahan stok (untuk audit trail)

```sql
CREATE TABLE stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id),
  quantity_change INT NOT NULL,
  old_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'purchase', 'sale', 'adjustment'
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  INDEX idx_product_id (product_id),
  INDEX idx_created_at (created_at)
);
```

---

### 5. Reports Table
Menyimpan laporan keuangan yang sudah di-generate

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,  -- 'profit_loss', 'product_performance', 'cash_flow'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_period (period_start, period_end)
);
```

---

### 6. Business Insights Table
Menyimpan insight dan rekomendasi yang di-generate AI

```sql
CREATE TABLE business_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(100) NOT NULL,  -- 'trend', 'recommendation', 'alert'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  metrics JSONB,
  confidence_score DECIMAL(3, 2),
  priority VARCHAR(50),  -- 'high', 'medium', 'low'
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
);
```

---

## 🔍 Important Queries

### Monthly Revenue
```sql
SELECT 
  DATE_TRUNC('month', date) as month,
  SUM(amount) as total_revenue
FROM transactions
WHERE user_id = $1 AND type = 'income'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;
```

### Monthly Expenses
```sql
SELECT 
  category,
  SUM(amount) as total
FROM transactions
WHERE user_id = $1 AND type = 'expense' 
  AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category;
```

### Low Stock Products
```sql
SELECT *
FROM products
WHERE user_id = $1 AND current_stock <= min_stock
ORDER BY current_stock ASC;
```

### Top Selling Products
```sql
SELECT 
  p.id,
  p.name,
  SUM(t.quantity) as total_sold,
  SUM(t.amount) as total_revenue,
  SUM(t.quantity * p.cost_price) as total_cost
FROM transactions t
JOIN products p ON t.product_id = p.id
WHERE t.user_id = $1 AND t.type = 'income'
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 10;
```

### Profit Calculation (Period)
```sql
SELECT 
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as profit
FROM transactions
WHERE user_id = $1 
  AND date >= $2 
  AND date <= $3;
```

---

## 🛡️ Data Protection & Security

1. **Password Security**
   - Passwords hashed dengan bcrypt (min 10 rounds)
   - Never store plain passwords

2. **User Isolation**
   - Setiap user hanya bisa access data mereka sendiri
   - Gunakan `user_id` di WHERE clause untuk semua queries

3. **Audit Trail**
   - `stock_history` untuk track perubahan stok
   - `created_at` dan `updated_at` di setiap table
   - Log semua perubahan data penting

4. **Data Retention**
   - Keep transaction history minimal 3 tahun
   - Archive old reports jika perlu

---

## 📈 Indexing Strategy

```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Product queries
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_stock ON products(current_stock);

-- Transaction queries (most frequently accessed)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, type, date);
```

---

## 🔄 Migration Notes

Untuk setup database baru, jalankan:

```bash
# Create tables in order
psql -U postgres -d sidoku_db -f schema.sql

# Add initial data (if any)
psql -U postgres -d sidoku_db -f seed.sql
```
