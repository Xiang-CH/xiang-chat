// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  uuid,
  text,
  pgTableCreator,
  timestamp,
  varchar,
  jsonb
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `xiang-chat_${name}`);

export const sessions = createTable(
  "sessions",
  {
    sessionId: uuid("session_id").primaryKey().unique().defaultRandom(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    sessionTitle: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },

  (example) => ({
    userIdIndex: index("user_id_idx").on(example.userId),
  })
);

export const messages = createTable(
  "messages",
  {
    messageId: uuid("message_id").primaryKey().unique().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => sessions.sessionId),
    content: text("content"),
    contentReasoning: text("content_reasoning"),
    role: varchar("role", { length: 256 }),
    model: varchar("model", { length: 256 }),
    groundings: jsonb("groundings"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },

  (example) => ({
    sessionIdIndex: index("session_id_idx").on(example.sessionId),
  })
);