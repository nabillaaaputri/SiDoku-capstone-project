import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/v1/auth', authRoutes);

app.get('/', (request, response) => {
  response.status(200).json({
    message: 'SiDoku Backend API is running',
  });
});

export default app;