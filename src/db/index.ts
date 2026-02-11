import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import config from '../config/config';

const client = createClient({
  url: config.db.url,
});

export const db = drizzle(client);
