import { app } from './app.js';
import { connectToDatabase } from './config/database.js';
import { env } from './config/env.js';

await connectToDatabase();

app.listen(env.port, () => {
  console.log(`SyncTalk backend listening on http://127.0.0.1:${env.port}`);
});
