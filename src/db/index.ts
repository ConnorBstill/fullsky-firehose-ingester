import { drizzle } from 'drizzle-orm/node-postgres';

import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL ? process.env.DATABASE_URL : '';

export const db = drizzle(DATABASE_URL);
