import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL ? process.env.DATABASE_URL : "";

export const db: NodePgDatabase<typeof schema> = drizzle(DATABASE_URL, {
  schema,
});
