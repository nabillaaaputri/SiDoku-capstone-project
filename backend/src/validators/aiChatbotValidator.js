import Joi from 'joi';

export const AiChatbotPayloadSchema = Joi.object({
  question: Joi.string().trim().required(),
});