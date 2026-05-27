import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 8000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173',
};
