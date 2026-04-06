import { Router } from "express";
import { db } from "@workspace/db";
import { listingsTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import {
  GetListingsQueryParams,
  CreateListingBody,
  UpdateListingBody,
  GetListingParams,
  UpdateListingParams,
  PublishListingParams,
  PublishListingBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = GetListingsQueryParams.parse(req.query);
  const conditions = [];

  if (query.district) conditions.push(eq(listingsTable.district, query.district));
  if (query.rooms !== undefined) conditions.push(eq(listingsTable.rooms, query.rooms));
  if (query.minPrice !== undefined) conditions.push(gte(listingsTable.priceUzs, query.minPrice));
  if (query.maxPrice !== undefined) conditions.push(lte(listingsTable.priceUzs, query.maxPrice));
  if (query.verified !== undefined) conditions.push(eq(listingsTable.verified, query.verified));
  if (query.has3dTour !== undefined) conditions.push(eq(listingsTable.has3dTour, query.has3dTour));
  if (query.hasInsurance !== undefined) conditions.push(eq(listingsTable.hasInsurance, query.hasInsurance));
  if (query.plan) conditions.push(eq(listingsTable.plan, query.plan as "basic" | "pro"));
  if (query.ownerId !== undefined) conditions.push(eq(listingsTable.ownerId, query.ownerId));

  const sessionUserId = (req.session as any)?.userId;
  const isOwnerViewingOwn = query.ownerId !== undefined && sessionUserId === query.ownerId;
  if (!isOwnerViewingOwn) {
    conditions.push(eq(listingsTable.published, true));
  }

  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;

  const listings = await db
    .select()
    .from(listingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(sql`${listingsTable.plan} desc, ${listingsTable.createdAt} desc`);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(listingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const enriched = await Promise.all(
    listings.map(async (listing) => {
      const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, listing.ownerId)).limit(1);
      return {
        ...listing,
        ownerName: owner?.name ?? "Unknown",
        ownerVerified: owner?.verified ?? false,
      };
    })
  );

  res.json({ listings: enriched, total: Number(countResult?.count ?? 0), offset, limit });
});

router.get("/featured", async (req, res) => {
  const listings = await db
    .select()
    .from(listingsTable)
    .where(and(eq(listingsTable.published, true), eq(listingsTable.plan, "pro")))
    .limit(12)
    .orderBy(sql`${listingsTable.createdAt} desc`);

  const enriched = await Promise.all(
    listings.map(async (listing) => {
      const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, listing.ownerId)).limit(1);
      return {
        ...listing,
        ownerName: owner?.name ?? "Unknown",
        ownerVerified: owner?.verified ?? false,
      };
    })
  );

  res.json({ listings: enriched, total: enriched.length, offset: 0, limit: 12 });
});

router.get("/:id", async (req, res) => {
  const { id } = GetListingParams.parse(req.params);
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id)).limit(1);
  if (!listing) return res.status(404).json({ error: "Not found" });

  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, listing.ownerId)).limit(1);

  res.json({
    ...listing,
    ownerName: owner?.name ?? "Unknown",
    ownerVerified: owner?.verified ?? false,
  });
});

router.post("/", async (req, res) => {
  const body = CreateListingBody.parse(req.body);
  const [listing] = await db
    .insert(listingsTable)
    .values({
      ...body,
      plan: body.plan as "basic" | "pro",
    })
    .returning();
  res.status(201).json(listing);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateListingParams.parse(req.params);
  const body = UpdateListingBody.parse(req.body);
  const [listing] = await db
    .update(listingsTable)
    .set(body as Partial<typeof listingsTable.$inferInsert>)
    .where(eq(listingsTable.id, id))
    .returning();
  if (!listing) return res.status(404).json({ error: "Not found" });
  res.json(listing);
});

router.post("/:id/publish", async (req, res) => {
  const { id } = PublishListingParams.parse(req.params);
  const body = PublishListingBody.parse(req.body);
  const [listing] = await db
    .update(listingsTable)
    .set({ published: body.published })
    .where(eq(listingsTable.id, id))
    .returning();
  if (!listing) return res.status(404).json({ error: "Not found" });
  res.json(listing);
});

export default router;
