import pino from "pino";
import { VercelPgDatabase } from "drizzle-orm/vercel-postgres";

import { IdResolver } from "@atproto/identity";
import { Firehose, Event } from "@atproto/sync";

import { post } from "./db/schema";
import * as Post from "./lexicon/types/com/fullsky/post";
import { eq } from "drizzle-orm";

export function createIngester(db: VercelPgDatabase, idResolver: IdResolver) {
  const logger = pino({ name: "firehose ingestion" });

  console.log("Tapping into Firehose");

  return new Firehose({
    idResolver,
    handleEvent: async (evt: Event) => {
      // Watch for write events
      if (evt.event === "create" || evt.event === "update") {
        console.log("evt", evt);
        const now = new Date();
        const record = evt.record;

        // If the write is a valid status update
        if (
          evt.collection === "com.fullsky.post" &&
          Post.isRecord(record) &&
          Post.validateRecord(record).success
        ) {
          await db.insert(post).values({
            uri: evt.uri.toString(),
            authorDid: evt.did,
            body: record.body,
            createdAt: record.createdAt,
            indexedAt: now.toISOString(),
          });
          // For when we maybe allow editing posts in the future
          // .onConflictDoUpdate({
          //   target: post.uri,
          //   set: {
          //     body: record.body,
          //     indexedAt: now.toISOString(),
          //   }
          // })
        }
      } else if (
        evt.event === "delete" &&
        evt.collection === "com.fullsky.post"
      ) {
        // Remove the status from our SQLite
        await db.delete(post).where(eq(post.uri, evt.uri.toString()));
      }
    },
    onError: (err: Error) => {
      logger.error({ err }, "error on firehose ingestion");
    },
    filterCollections: ["com.fullsky.post"],
    excludeIdentity: true,
    excludeAccount: true,
  });
}
