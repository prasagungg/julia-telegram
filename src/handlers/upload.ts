import { sendPhotoToTelegram } from '../services/telegram';

export async function handleUpload({ body, set }: { body: { image: File }, set: any }) {
  try {
    const file = body.image;
    
    // Call the service
    const fileId = await sendPhotoToTelegram(file);

    return {
      success: true,
      data: {
        file_id: fileId,
      },
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}
