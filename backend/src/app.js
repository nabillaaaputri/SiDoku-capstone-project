import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productsRoutes from './routes/productRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import stockInRoutes from './routes/stockInsRoutes.js';
import stockOutRoutes from './routes/stockOutsRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import sellingRecapRoutes from './routes/sellingRecapRoutes.js';
import aiChatbotRoutes from './routes/aiChatbotRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/v1/auth', authRoutes);
app.use('/v1/products', productsRoutes);
app.use('/v1/dashboard', dashboardRoutes);
app.use('/v1/settings', settingsRoutes);
app.use('/v1/stocks-in', stockInRoutes);
app.use('/v1/stocks-out', stockOutRoutes);
app.use('/v1/expenses', expenseRoutes);
app.use('/v1/selling-recap', sellingRecapRoutes);
app.use('/v1/ai-chatbot', aiChatbotRoutes);

app.get('/', (request, response) => {
  response.status(200).json({
    message: 'SiDoku Backend API is running',
  });
});

export default app;