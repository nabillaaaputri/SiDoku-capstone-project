import axios from "axios";

import apiClient from "./api";

interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
}

interface AiChatbotResponseData {
  question?: string;
  answer?: string;
  action?: string;
  tag?: string;
  data?: unknown;
}

export interface AiChatbotAnswer {
  question: string;
  answer: string;
  action?: string;
  tag?: string;
  data?: unknown;
}

export const askAiChatbot = async (
  question: string,
): Promise<AiChatbotAnswer> => {
  const response = await apiClient.post<ApiResponse<AiChatbotResponseData>>(
    "/ai-chatbot/ask",
    {
      question,
    },
  );

  const responseData = response.data.data;

  return {
    question: responseData?.question || question,
    answer:
      responseData?.answer?.trim() ||
      response.data.message ||
      "Maaf, AI belum bisa memberikan jawaban saat ini.",
    action: responseData?.action,
    tag: responseData?.tag,
    data: responseData?.data,
  };
};

export const getAiChatbotErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          message?: unknown;
          data?: { message?: unknown };
          error?: unknown;
        }
      | undefined;

    const candidates = [
      responseData?.message,
      responseData?.data?.message,
      responseData?.error,
      error.message,
    ];

    const message = candidates.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );

    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Maaf, chatbot AI sedang bermasalah. Coba lagi sebentar lagi.";
};
