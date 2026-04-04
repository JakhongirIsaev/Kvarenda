import { Router } from "express";
import { db } from "@workspace/db";
import { contractsTable, applicationsTable, listingsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetContractsQueryParams,
  CreateContractBody,
  GetContractParams,
  SignContractParams,
  SignContractBody,
} from "@workspace/api-zod";

const router = Router();

async function enrichContract(contract: typeof contractsTable.$inferSelect) {
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, contract.listingId)).limit(1);
  const [tenant] = await db.select().from(usersTable).where(eq(usersTable.id, contract.tenantId)).limit(1);
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, contract.ownerId)).limit(1);
  return {
    ...contract,
    listingTitle: listing?.title ?? "",
    address: listing?.address ?? "",
    tenantName: tenant?.name ?? "Unknown",
    ownerName: owner?.name ?? "Unknown",
    tenantSignedAt: contract.tenantSignedAt?.toISOString(),
    ownerSignedAt: contract.ownerSignedAt?.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const query = GetContractsQueryParams.parse(req.query);
  const conditions = [];

  if (query.tenantId !== undefined) conditions.push(eq(contractsTable.tenantId, query.tenantId));
  if (query.ownerId !== undefined) conditions.push(eq(contractsTable.ownerId, query.ownerId));
  if (query.status) conditions.push(eq(contractsTable.status, query.status as "draft" | "pending_signatures" | "active" | "terminated"));

  const contracts = await db.select().from(contractsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(contractsTable.createdAt);
  const enriched = await Promise.all(contracts.map(enrichContract));
  res.json(enriched);
});

router.get("/:id", async (req, res) => {
  const { id } = GetContractParams.parse(req.params);
  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, id)).limit(1);
  if (!contract) return res.status(404).json({ error: "Not found" });
  res.json(await enrichContract(contract));
});

router.post("/", async (req, res) => {
  const body = CreateContractBody.parse(req.body);

  const [application] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, body.applicationId)).limit(1);
  if (!application) return res.status(404).json({ error: "Application not found" });

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, application.listingId)).limit(1);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const serviceFeeUzs = Math.round(listing.priceUzs * 0.05);

  const [contract] = await db.insert(contractsTable).values({
    applicationId: body.applicationId,
    listingId: application.listingId,
    tenantId: application.tenantId,
    ownerId: listing.ownerId,
    startDate: body.startDate,
    endDate: body.endDate,
    monthlyRentUzs: listing.priceUzs,
    depositUzs: listing.deposit ?? 0,
    serviceFeePercent: 5,
    status: "pending_signatures",
    terms: body.terms ?? `Standard rental agreement for ${listing.title}. The tenant agrees to pay ${listing.priceUzs.toLocaleString()} UZS per month plus a 5% platform service fee. The tenant must maintain the property in good condition and follow all house rules.`,
  }).returning();

  res.status(201).json(await enrichContract(contract));
});

router.post("/:id/sign", async (req, res) => {
  const { id } = SignContractParams.parse(req.params);
  const body = SignContractBody.parse(req.body);

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, id)).limit(1);
  if (!contract) return res.status(404).json({ error: "Not found" });

  const update: Partial<typeof contractsTable.$inferInsert> = {};
  if (body.role === "tenant") {
    update.tenantSigned = true;
    update.tenantSignedAt = new Date();
  } else {
    update.ownerSigned = true;
    update.ownerSignedAt = new Date();
  }

  const refreshed = { ...contract, ...update };
  if (refreshed.tenantSigned && refreshed.ownerSigned) {
    update.status = "active";
  }

  const [updated] = await db.update(contractsTable).set(update).where(eq(contractsTable.id, id)).returning();
  res.json(await enrichContract(updated));
});

export default router;
