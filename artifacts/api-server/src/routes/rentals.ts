import { Router } from "express";
import { db } from "@workspace/db";
import { rentalsTable, listingsTable, usersTable, paymentsTable } from "@workspace/db";
import { eq, and, sum } from "drizzle-orm";
import {
  GetRentalsQueryParams,
  GetRentalParams,
} from "@workspace/api-zod";

const router = Router();

async function enrichRental(rental: typeof rentalsTable.$inferSelect) {
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, rental.listingId)).limit(1);
  const [tenant] = await db.select().from(usersTable).where(eq(usersTable.id, rental.tenantId)).limit(1);
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, rental.ownerId)).limit(1);
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.rentalId, rental.id));
  const totalPaid = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.totalUzs, 0);

  const startDate = new Date(rental.startDate);
  const now = new Date();
  const monthsElapsed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  const nextPaymentDate = new Date(startDate);
  nextPaymentDate.setMonth(startDate.getMonth() + monthsElapsed + 1);

  return {
    ...rental,
    listingTitle: listing?.title ?? "",
    address: listing?.address ?? "",
    district: listing?.district ?? "",
    photos: listing?.photos ?? [],
    tenantName: tenant?.name ?? "Unknown",
    ownerName: owner?.name ?? "Unknown",
    totalPaid,
    paymentsCount: payments.length,
    nextPaymentDate: nextPaymentDate.toISOString().split("T")[0],
    insuranceStatus: listing?.insuranceStatus ?? "none",
  };
}

router.get("/", async (req, res) => {
  const query = GetRentalsQueryParams.parse(req.query);
  const conditions = [];

  if (query.tenantId !== undefined) conditions.push(eq(rentalsTable.tenantId, query.tenantId));
  if (query.ownerId !== undefined) conditions.push(eq(rentalsTable.ownerId, query.ownerId));
  if (query.status) conditions.push(eq(rentalsTable.status, query.status as "active" | "completed" | "terminated"));

  const rentals = await db.select().from(rentalsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(rentalsTable.createdAt);
  const enriched = await Promise.all(rentals.map(enrichRental));
  res.json(enriched);
});

router.get("/:id", async (req, res) => {
  const { id } = GetRentalParams.parse(req.params);
  const [rental] = await db.select().from(rentalsTable).where(eq(rentalsTable.id, id)).limit(1);
  if (!rental) return res.status(404).json({ error: "Not found" });
  res.json(await enrichRental(rental));
});

export default router;
