export const config = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
};
