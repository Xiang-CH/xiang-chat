import { type Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? (() => { throw new Error("DATABASE_URL is not defined"); })(),
  },
  tablesFilter: ["xiang-chat_*"],
} satisfies Config;
