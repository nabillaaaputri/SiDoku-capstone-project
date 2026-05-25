import express from 'express';
import { askAiChatbot } from '../controllers/aiChatbotController.js';
import authenticateToken from '../middlewares/auth.js';
import validatePayload from '../middlewares/validatePayload.js';
import { AiChatbotPayloadSchema } from '../validators/aiChatbotValidator.js';

const aiChatbotRouter = express.Router();

aiChatbotRouter.post(
  '/ask',
  authenticateToken,
  validatePayload(AiChatbotPayloadSchema, 'Pertanyaan tidak boleh kosong.'),
  askAiChatbot,
);

export default aiChatbotRouter;