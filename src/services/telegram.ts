import { config } from '../config/env';

export async function sendPhotoToTelegram(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('chat_id', config.TELEGRAM_CHAT_ID);

  const url = `https://api.telegram.org/bot${config.TELEGRAM_TOKEN}/sendPhoto`;
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Telegram API Error: ${data.description}`);
  }

  // Find the largest photo size to return its file_id
  const photos = data.result.photo;
  const largestPhoto = photos[photos.length - 1];
  
  return largestPhoto.file_id;
}
