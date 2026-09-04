import { Elysia, t } from 'elysia';
import { handleUpload } from '../handlers/upload';

export const uploadRoute = new Elysia({ prefix: '/api' })
  .post('/upload', handleUpload, {
    body: t.Object({
      image: t.File(),
    }),
  });
