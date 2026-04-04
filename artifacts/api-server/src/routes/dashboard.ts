import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, listingsTable, rentalsTable, applicationsTable, paymentsTable, contractsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  GetOwnerDashboardParams,
  GetTenantDashboardParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/stats", async (req, res) => {
  const [totalListingsResult] = await db.select({ count: sql<number>`count(*)` }).from(listingsTable);
  const [activeListingsResult] = await db.select({ count: sql<number>`count(*)` }).from(listingsTable).where(eq(listingsTable.published, true));
  const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const [totalTenantsResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "tenant"));
  const [totalOwnersResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "owner"));
  const [activeRentalsResult] = await db.select({ count: sql<number>`count(*)` }).from(rentalsTable).where(eq(rentalsTable.status, "active"));
  const [pendingApplicationsResult] = await db.select({ count: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.status, "pending"));
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.status, "completed"));
  const totalRevenue = payments.reduce((sum, p) => sum + p.serviceFeeUzs, 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = payments
    .filter(p => p.paidAt && p.paidAt >= monthStart)
    .reduce((sum, p) => sum + p.serviceFeeUzs, 0);
  const [proListingsResult] = await db.select({ count: sql<number>`count(*)` }).from(listingsTable).where(eq(listingsTable.plan, "pro"));

  res.json({
    totalListings: Number(totalListingsResult?.count ?? 0),
    activeListings: Number(activeListingsResult?.count ?? 0),
    totalUsers: Number(totalUsersResult?.count ?? 0),
    totalTenants: Number(totalTenantsResult?.count ?? 0),
    totalOwners: Number(totalOwnersResult?.count ?? 0),
    activeRentals: Number(activeRentalsResult?.count ?? 0),
    pendingApplications: Number(pendingApplicationsResult?.count ?? 0),
    totalRevenueUzs: totalRevenue,
    monthlyRevenueUzs: monthlyRevenue,
    proListingsCount: Number(proListingsResult?.count ?? 0),
  });
});

router.get("/owner/:ownerId", async (req, res) => {
  const { ownerId } = GetOwnerDashboardParams.parse(req.params);

  const ownerListings = await db.select().from(listingsTable).where(eq(listingsTable.ownerId, ownerId));
  const listingIds = ownerListings.map((l) => l.id);

  let allApplications: (typeof applicationsTable.$inferSelect)[] = [];
  if (listingIds.length > 0) {
    allApplications = await db.select().from(applicationsTable);
    allApplications = allApplications.filter((a) => listingIds.includes(a.listingId));
  }

  const pendingApplications = allApplications.filter((a) => a.status === "pending");
  const rentals = await db.select().from(rentalsTable).where(and(eq(rentalsTable.ownerId, ownerId), eq(rentalsTable.status, "active")));
  const payments = await db.select().from(paymentsTable);
  const rentalIds = rentals.map((r) => r.id);
  const ownerPayments = payments.filter((p) => rentalIds.includes(p.rentalId) && p.status === "completed");
  const totalIncome = ownerPayments.reduce((sum, p) => sum + p.amountUzs, 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyIncome = ownerPayments
    .filter(p => p.paidAt && p.paidAt >= monthStart)
    .reduce((sum, p) => sum + p.amountUzs, 0);

  const recentApplications = allApplications.slice(-5).reverse();

  res.json({
    ownerId,
    activeListings: ownerListings.filter(l => l.published).length,
    totalApplications: allApplications.length,
    pendingApplications: pendingApplications.length,
    activeRentals: rentals.length,
    totalIncomeUzs: totalIncome,
    monthlyIncomeUzs: monthlyIncome,
    recentApplications,
  });
});

router.get("/tenant/:tenantId", async (req, res) => {
  const { tenantId } = GetTenantDashboardParams.parse(req.params);

  const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.tenantId, tenantId));
  const rentals = await db.select().from(rentalsTable).where(and(eq(rentalsTable.tenantId, tenantId), eq(rentalsTable.status, "active")));
  const currentRental = rentals[0];

  let enrichedRental = null;
  let recentPayments: (typeof paymentsTable.$inferSelect)[] = [];
  if (currentRental) {
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, currentRental.listingId)).limit(1);
    const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, currentRental.ownerId)).limit(1);
    const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.rentalId, currentRental.id));
    const totalPaid = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.totalUzs, 0);

    const startDate = new Date(currentRental.startDate);
    const now = new Date();
    const monthsElapsed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setMonth(startDate.getMonth() + monthsElapsed + 1);

    enrichedRental = {
      ...currentRental,
      listingTitle: listing?.title ?? "",
      address: listing?.address ?? "",
      district: listing?.district ?? "",
      photos: listing?.photos ?? [],
      tenantName: "",
      ownerName: owner?.name ?? "Unknown",
      totalPaid,
      paymentsCount: payments.length,
      nextPaymentDate: nextPaymentDate.toISOString().split("T")[0],
      insuranceStatus: listing?.insuranceStatus ?? "none",
    };

    recentPayments = payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
  }

  const nextPaymentAmount = currentRental ? currentRental.monthlyRentUzs + currentRental.serviceFeeUzs : 0;
  const startDate = currentRental ? new Date(currentRental.startDate) : new Date();
  const now = new Date();
  const monthsElapsed = currentRental ? (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()) : 0;
  const nextPaymentDate = new Date(startDate);
  nextPaymentDate.setMonth(startDate.getMonth() + monthsElapsed + 1);

  res.json({
    tenantId,
    currentRental: enrichedRental,
    pendingApplications: applications.filter(a => a.status === "pending").length,
    totalApplications: applications.length,
    recentPayments: recentPayments.map(p => ({ ...p, paidAt: p.paidAt?.toISOString() })),
    nextPaymentAmount,
    nextPaymentDate: currentRental ? nextPaymentDate.toISOString().split("T")[0] : undefined,
  });
});

export default router;
