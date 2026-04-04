import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, rentalsTable } from "@workspace/db";
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
