import express from 'express';
import { askAiChatbot } from '../controllers/aiChatbotController.js';

const aiChatbotRouter = express.Router();

aiChatbotRouter.post('/ask', askAiChatbot);

export default aiChatbotRouter;