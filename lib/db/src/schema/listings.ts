import { pgTable, serial, text, boolean, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingPlanEnum = pgEnum("listing_plan", ["basic", "pro"]);
export const listingStatusEnum = pgEnum("listing_status", ["draft", "pending_moderation", "active", "paused", "archived"]);
export const insuranceStatusEnum = pgEnum("insurance_status", ["none", "available", "in_manual_processing", "insured", "expired"]);

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  district: text("district").notNull(),
  rooms: integer("rooms").notNull(),
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  area: real("area"),
  priceUzs: integer("price_uzs").notNull(),
  deposit: integer("deposit"),
  plan: listingPlanEnum("plan").notNull().default("basic"),
  status: listingStatusEnum("status").notNull().default("draft"),
  published: boolean("published").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  has3dTour: boolean("has_3d_tour").notNull().default(false),
  hasInsurance: boolean("has_insurance").notNull().default(false),
  insuranceStatus: insuranceStatusEnum("insurance_status").notNull().default("none"),
  amenities: text("amenities").array(),
  photos: text("photos").array(),
  rules: text("rules"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
