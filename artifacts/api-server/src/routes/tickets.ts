import { Router } from "express";
import { db } from "@workspace/db";
import { ticketsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

async function enrichTicket(ticket: typeof ticketsTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, ticket.userId)).limit(1);
  return {
    ...ticket,
    userName: user?.name ?? "Unknown",
    userRole: user?.role ?? "tenant",
    resolvedAt: ticket.resolvedAt?.toISOString(),
  };
}

// List tickets (filter by userId or all for admin)
router.get("/", async (req, res) => {
  const { userId, status } = req.query as { userId?: string; status?: string };
  const conditions = [];
  if (userId) conditions.push(eq(ticketsTable.userId, Number(userId)));
  if (status) conditions.push(eq(ticketsTable.status, status as any));

  const tickets = await db
    .select()
    .from(ticketsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(ticketsTable.createdAt);

  const enriched = await Promise.all(tickets.map(enrichTicket));
  res.json(enriched);
});

// Get single ticket
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id)).limit(1);
  if (!ticket) return res.status(404).json({ error: "Not found" });
  res.json(await enrichTicket(ticket));
});

// Create ticket
router.post("/", async (req, res) => {
  const { userId, rentalId, listingId, category, subject, description } = req.body;
  if (!userId || !subject || !description) {
    return res.status(400).json({ error: "userId, subject, and description are required" });
  }
  const [ticket] = await db.insert(ticketsTable).values({
    userId: Number(userId),
    rentalId: rentalId ? Number(rentalId) : null,
    listingId: listingId ? Number(listingId) : null,
    category: category || "other",
    subject,
    description,
  }).returning();
  res.status(201).json(await enrichTicket(ticket));
});

// Update ticket status (admin)
router.put("/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status, adminNote } = req.body as { status: string; adminNote?: string };
  const update: Partial<typeof ticketsTable.$inferInsert> = {
    status: status as any,
    adminNote: adminNote ?? undefined,
  };
  if (status === "resolved" || status === "closed") {
    (update as any).resolvedAt = new Date();
  }
  const [ticket] = await db
    .update(ticketsTable)
    .set(update)
    .where(eq(ticketsTable.id, id))
    .returning();
  if (!ticket) return res.status(404).json({ error: "Not found" });
  res.json(await enrichTicket(ticket));
});

export default router;
