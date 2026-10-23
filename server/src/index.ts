import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

try {
  await connectDatabase();
  const server = app.listen(env.PORT, () => console.log(`Nexus API listening on ${env.PORT}`));
  const shutdown = async () => { server.close(); process.exit(0); };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} catch (error) {
  console.error('Unable to start Nexus API', error);
  process.exit(1);
}
