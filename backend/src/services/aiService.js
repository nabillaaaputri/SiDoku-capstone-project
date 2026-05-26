import axios from 'axios';

const getAiServiceUrl = () => {
  const aiServiceUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceUrl) {
    throw new Error('AI_SERVICE_URL belum dikonfigurasi.');
  }

  return aiServiceUrl.replace(/\/$/, '');
};

export const predictSales = async (payload) => {
  const aiServiceUrl = getAiServiceUrl();

  const result = await axios.post(`${aiServiceUrl}/predict`, payload, {
    timeout: 30000,
  });

  return result.data;
};

export const getInsights = async (products) => {
  const aiServiceUrl = getAiServiceUrl();

  const result = await axios.post(
    `${aiServiceUrl}/insights`,
    { products },
    { timeout: 30000 },
  );

  return result.data;
};

export const getRecommendations = async (products) => {
  const aiServiceUrl = getAiServiceUrl();

  const result = await axios.post(
    `${aiServiceUrl}/recommend`,
    { products },
    { timeout: 30000 },
  );

  return result.data;
};

export const sendChatMessage = async (message) => {
  const aiServiceUrl = getAiServiceUrl();

  const result = await axios.post(
    `${aiServiceUrl}/chat`,
    { message },
    { timeout: 30000 },
  );

  return result.data;
};