import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, rentalsTable, contractsTable, listingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetPaymentsQueryParams,
  CreatePaymentBody,
  ConfirmCashPaymentParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = GetPaymentsQueryParams.parse(req.query);
  const conditions = [];

  if (query.rentalId !== undefined) conditions.push(eq(paymentsTable.rentalId, query.rentalId));
  if (query.tenantId !== undefined) conditions.push(eq(paymentsTable.tenantId, query.tenantId));
  if (query.status) conditions.push(eq(paymentsTable.status, query.status as "pending" | "completed" | "failed" | "declared"));

  const payments = await db.select().from(paymentsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(paymentsTable.createdAt);
  res.json(payments.map(p => ({
    ...p,
    paidAt: p.paidAt?.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const body = CreatePaymentBody.parse(req.body);
  const serviceFeeUzs = Math.round(body.amountUzs * 0.05);
  const totalUzs = body.amountUzs + serviceFeeUzs;

  const isOnline = body.method === "online";
  const [payment] = await db.insert(paymentsTable).values({
    rentalId: body.rentalId,
    tenantId: body.tenantId,
    period: body.period,
    amountUzs: body.amountUzs,
    serviceFeeUzs,
    totalUzs,
    method: body.method as "online" | "cash",
    status: isOnline ? "completed" : "declared",
    ownerConfirmed: isOnline,
    paidAt: isOnline ? new Date() : undefined,
  }).returning();

  res.status(201).json({ ...payment, paidAt: payment.paidAt?.toISOString() });
});

// First payment — creates rental after successful payment
router.post("/first-payment", async (req, res) => {
  const { contractId, tenantId, method } = req.body as {
    contractId: number;
    tenantId: number;
    method?: string;
  };
  if (!contractId || !tenantId) {
    return res.status(400).json({ error: "contractId and tenantId required" });
  }

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, contractId)).limit(1);
  if (!contract) return res.status(404).json({ error: "Contract not found" });
  if (contract.status !== "active") {
    return res.status(400).json({ error: "Contract must be fully signed before payment" });
  }

  // Check if rental already exists for this contract
  const [existingRental] = await db.select().from(rentalsTable).where(eq(rentalsTable.contractId, contractId)).limit(1);
  if (existingRental) {
    return res.status(409).json({ error: "Rental already activated for this contract" });
  }

  const serviceFeeUzs = Math.round(contract.monthlyRentUzs * (contract.serviceFeePercent / 100));
  const totalUzs = contract.monthlyRentUzs + serviceFeeUzs;
  const paymentMethod = (method || "online") as "online" | "cash";
  const isOnline = paymentMethod === "online";

  // Create the first payment
  const [payment] = await db.insert(paymentsTable).values({
    rentalId: 0, // placeholder, will update after rental creation
    tenantId,
    period: contract.startDate.slice(0, 7), // "YYYY-MM"
    amountUzs: contract.monthlyRentUzs,
    serviceFeeUzs,
    totalUzs,
    method: paymentMethod,
    status: isOnline ? "completed" : "declared",
    ownerConfirmed: isOnline,
    paidAt: isOnline ? new Date() : undefined,
  }).returning();

  // Create the rental
  const [rental] = await db.insert(rentalsTable).values({
    contractId: contract.id,
    listingId: contract.listingId,
    tenantId: contract.tenantId,
    ownerId: contract.ownerId,
    monthlyRentUzs: contract.monthlyRentUzs,
    serviceFeeUzs,
    startDate: contract.startDate,
    endDate: contract.endDate,
    status: "active",
    protectedRent: true,
  }).returning();

  // Update payment with actual rentalId
  await db.update(paymentsTable).set({ rentalId: rental.id }).where(eq(paymentsTable.id, payment.id));

  // Pause the listing (it's now rented)
  await db.update(listingsTable).set({
    status: "paused",
    published: false,
  } as any).where(eq(listingsTable.id, contract.listingId));

  res.status(201).json({
    payment: { ...payment, rentalId: rental.id, paidAt: payment.paidAt?.toISOString() },
    rental,
  });
});

router.post("/:id/confirm", async (req, res) => {
  const { id } = ConfirmCashPaymentParams.parse(req.params);
  const [payment] = await db
    .update(paymentsTable)
    .set({ ownerConfirmed: true, status: "completed", paidAt: new Date() })
    .where(eq(paymentsTable.id, id))
    .returning();
  if (!payment) return res.status(404).json({ error: "Not found" });
  res.json({ ...payment, paidAt: payment.paidAt?.toISOString() });
});

export default router;
