import { Router } from "express";
import { db } from "@workspace/db";
import { applicationsTable, listingsTable, usersTable, contractsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetApplicationsQueryParams,
  CreateApplicationBody,
  GetApplicationParams,
  UpdateApplicationStatusParams,
  UpdateApplicationStatusBody,
} from "@workspace/api-zod";

const router = Router();

async function enrichApplication(app: typeof applicationsTable.$inferSelect) {
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, app.listingId)).limit(1);
  const [tenant] = await db.select().from(usersTable).where(eq(usersTable.id, app.tenantId)).limit(1);
  // Look up the contract for this application (if any)
  const [contract] = await db.select({ id: contractsTable.id }).from(contractsTable).where(eq(contractsTable.applicationId, app.id)).limit(1);
  return {
    ...app,
    listingTitle: listing?.title ?? "",
    district: listing?.district ?? "",
    priceUzs: listing?.priceUzs ?? 0,
    tenantName: tenant?.name ?? "Unknown",
    tenantEmail: tenant?.email ?? "",
    tenantPhone: tenant?.phone ?? "",
    tenantVerified: tenant?.verified ?? false,
    contractId: contract?.id ?? null,
  };
}

router.get("/", async (req, res) => {
  const sessionUserId = (req.session as any)?.userId;
  if (!sessionUserId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const query = GetApplicationsQueryParams.parse(req.query);
  const conditions = [];

  if (query.listingId !== undefined) conditions.push(eq(applicationsTable.listingId, query.listingId));
  if (query.tenantId !== undefined) conditions.push(eq(applicationsTable.tenantId, query.tenantId));
  if (query.status) conditions.push(eq(applicationsTable.status, query.status as "pending" | "approved" | "rejected" | "cancelled"));

  let applications;
  if (query.ownerId !== undefined) {
    const ownerListings = await db.select({ id: listingsTable.id }).from(listingsTable).where(eq(listingsTable.ownerId, query.ownerId));
    const listingIds = ownerListings.map((l) => l.id);
    if (listingIds.length === 0) return res.json([]);
    applications = await db.select().from(applicationsTable).where(
      and(...conditions, ...(listingIds.length > 0 ? [] : []))
    ).orderBy(applicationsTable.createdAt);

    applications = applications.filter((a) => listingIds.includes(a.listingId));
  } else {
    applications = await db.select().from(applicationsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(applicationsTable.createdAt);
  }

  const enriched = await Promise.all(applications.map(enrichApplication));
  res.json(enriched);
});

router.get("/:id", async (req, res) => {
  const { id } = GetApplicationParams.parse(req.params);
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id)).limit(1);
  if (!app) return res.status(404).json({ error: "Not found" });
  res.json(await enrichApplication(app));
});

router.post("/", async (req, res) => {
  const body = CreateApplicationBody.parse(req.body);
  const [app] = await db.insert(applicationsTable).values(body).returning();
  res.status(201).json(await enrichApplication(app));
});

router.put("/:id/status", async (req, res) => {
  const { id } = UpdateApplicationStatusParams.parse(req.params);
  const body = UpdateApplicationStatusBody.parse(req.body);
  const [app] = await db
    .update(applicationsTable)
    .set({ status: body.status as "approved" | "rejected", note: body.note })
    .where(eq(applicationsTable.id, id))
    .returning();
  if (!app) return res.status(404).json({ error: "Not found" });

  // Auto-create contract when application is approved
  if (body.status === "approved") {
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, app.listingId)).limit(1);
    if (listing) {
      const startDate = app.moveInDate;
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + app.durationMonths);
      const endDate = end.toISOString().split("T")[0];

      await db.insert(contractsTable).values({
        applicationId: app.id,
        listingId: app.listingId,
        tenantId: app.tenantId,
        ownerId: listing.ownerId,
        startDate,
        endDate,
        monthlyRentUzs: listing.priceUzs,
        depositUzs: listing.deposit ?? 0,
        serviceFeePercent: 5,
        status: "pending_signatures",
        terms: JSON.stringify({
          en: `Rental agreement for ${listing.address}. Monthly rent: ${listing.priceUzs.toLocaleString()} UZS + 5% platform service fee. Deposit: ${(listing.deposit ?? 0).toLocaleString()} UZS. Duration: ${app.durationMonths} months.`,
          ru: `Договор аренды по адресу ${listing.address}. Ежемесячная арендная плата: ${listing.priceUzs.toLocaleString()} UZS + 5% сервисный сбор платформы. Депозит: ${(listing.deposit ?? 0).toLocaleString()} UZS. Срок: ${app.durationMonths} мес.`,
          uz: `${listing.address} manzili bo'yicha ijara shartnomasi. Oylik ijara: ${listing.priceUzs.toLocaleString()} UZS + 5% platforma xizmat to'lovi. Depozit: ${(listing.deposit ?? 0).toLocaleString()} UZS. Muddat: ${app.durationMonths} oy.`,
        }),
      });
    }
  }

  res.json(await enrichApplication(app));
});

export default router;
