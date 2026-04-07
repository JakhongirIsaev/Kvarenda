import { pgTable, serial, text, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentMethodEnum = pgEnum("payment_method", ["online", "cash"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "declared", "cancelled"]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  rentalId: integer("rental_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  period: text("period").notNull(),
  amountUzs: integer("amount_uzs").notNull(),
  serviceFeeUzs: integer("service_fee_uzs").notNull(),
  totalUzs: integer("total_uzs").notNull(),
  method: paymentMethodEnum("method").notNull().default("online"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  ownerConfirmed: boolean("owner_confirmed").notNull().default(false),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
