import pino from "pino";
import { nanoid } from "nanoid";

import { IdResolver } from "@atproto/identity";
import { Firehose, Event } from "@atproto/sync";

import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "./db/schema";
import * as Post from "./lexicon/types/com/fullsky/post";

export function createIngester(
  db: NodePgDatabase<typeof schema>,
  idResolver: IdResolver,
) {
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
          let uuid;

          while (!uuid) {
            const nanoId = nanoid(6);

            const uuidExists = await db.query.post.findFirst({
              where: (data, { eq }) => eq(data.uuid, nanoId),
            });

            if (!uuidExists) {
              uuid = nanoId;
            }
          }

          const newPost: schema.Post = {
            uuid,
            uri: evt.uri.toString(),
            authorDid: evt.did,
            body: record.body,
            title: record.title,
            createdAt: record.createdAt,
            indexedAt: now.toISOString(),
          };

          await db
            .insert(schema.post)
            .values(newPost)
            .onConflictDoUpdate({
              target: schema.post.uri,
              set: {
                body: record.body,
                indexedAt: now.toISOString(),
              },
            });
        }
      } else if (
        evt.event === "delete" &&
        evt.collection === "com.fullsky.post"
      ) {
        // Remove the status from our SQLite
        await db
          .delete(schema.post)
          .where(eq(schema.post.uri, evt.uri.toString()));
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
