import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected", "cancelled"]);

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  moveInDate: text("move_in_date").notNull(),
  durationMonths: integer("duration_months").notNull(),
  purpose: text("purpose"),
  message: text("message"),
  status: applicationStatusEnum("status").notNull().default("pending"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
