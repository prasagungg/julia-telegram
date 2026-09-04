import { Elysia } from 'elysia';
import { uploadRoute } from './routes';
import { config } from './config/env';

const app = new Elysia()
  .use(uploadRoute)
  .listen(config.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
