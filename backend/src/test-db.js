import 'dotenv/config';
import { query } from './config/database.js';

const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connected:', result.rows[0]);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

testConnection();