import { pgTable, serial, text, boolean, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractStatusEnum = pgEnum("contract_status", ["draft", "pending_signatures", "active", "cancelled", "terminated"]);

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  listingId: integer("listing_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  ownerId: integer("owner_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  monthlyRentUzs: integer("monthly_rent_uzs").notNull(),
  depositUzs: integer("deposit_uzs").notNull().default(0),
  serviceFeePercent: real("service_fee_percent").notNull().default(5),
  status: contractStatusEnum("status").notNull().default("draft"),
  tenantSigned: boolean("tenant_signed").notNull().default(false),
  ownerSigned: boolean("owner_signed").notNull().default(false),
  tenantSignedAt: timestamp("tenant_signed_at"),
  ownerSignedAt: timestamp("owner_signed_at"),
  terms: text("terms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({ id: true, createdAt: true });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
