import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 8000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173',
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/synctalk',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  streamApiKey: process.env.STREAM_API_KEY ?? '',
  streamApiSecret: process.env.STREAM_API_SECRET ?? '',
};
