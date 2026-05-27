import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`SyncTalk backend listening on http://127.0.0.1:${env.port}`);
});
