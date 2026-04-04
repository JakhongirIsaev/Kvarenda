import { pgTable, serial, text, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rentalStatusEnum = pgEnum("rental_status", ["active", "completed", "terminated"]);

export const rentalsTable = pgTable("rentals", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  listingId: integer("listing_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  ownerId: integer("owner_id").notNull(),
  monthlyRentUzs: integer("monthly_rent_uzs").notNull(),
  serviceFeeUzs: integer("service_fee_uzs").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: rentalStatusEnum("status").notNull().default("active"),
  protectedRent: boolean("protected_rent").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRentalSchema = createInsertSchema(rentalsTable).omit({ id: true, createdAt: true });
export type InsertRental = z.infer<typeof insertRentalSchema>;
export type Rental = typeof rentalsTable.$inferSelect;
