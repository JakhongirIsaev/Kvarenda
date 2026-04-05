import { useState } from "react";
import { Link } from "wouter";
import { BarChart3, Users, Building, DollarSign, Shield, Eye, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetDashboardStats, useGetUsers, useGetListings, useGetPayments, useGetApplications,
  getGetDashboardStatsQueryKey, getGetUsersQueryKey, getGetListingsQueryKey, getGetPaymentsQueryKey, getGetApplicationsQueryKey,
} from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { useI18n, useT } from "@/lib/i18n";
import { formatUzs } from "@/lib/utils";
import { motion } from "framer-motion";

export function Admin() {
  const { role } = useRole();
  const { t } = useI18n();
  const { tr } = useT();

  const isAdmin = role === "admin";
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey(), enabled: isAdmin } });
  const { data: usersData } = useGetUsers({ query: { queryKey: getGetUsersQueryKey(), enabled: isAdmin } });
  const { data: listingsData } = useGetListings({ limit: 50 }, { query: { queryKey: getGetListingsQueryKey({ limit: 50 }), enabled: isAdmin } });
  const { data: paymentsData } = useGetPayments(undefined, { query: { queryKey: getGetPaymentsQueryKey(), enabled: isAdmin } });
  const { data: applicationsData } = useGetApplications(undefined, { query: { queryKey: getGetApplicationsQueryKey(), enabled: isAdmin } });

  const users = usersData ?? [];
  const listings = listingsData?.listings ?? [];
  const payments = paymentsData ?? [];
  const applications = applicationsData ?? [];

  if (role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">{tr(t.admin.accessRequired)}</p>
        <p className="text-muted-foreground">{tr(t.admin.switchAdmin)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{tr(t.admin.title)}</h1>
          <p className="text-muted-foreground">{tr(t.admin.overview)}</p>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
            {[
              { label: tr(t.admin.totalUsers), value: stats.totalUsers, icon: Users, color: "text-blue-500", sub: `${stats.totalTenants} · ${stats.totalOwners}` },
              { label: tr(t.admin.activeListings), value: `${stats.activeListings}/${stats.totalListings}`, icon: Building, color: "text-green-500", sub: `${stats.proListingsCount} pro` },
              { label: tr(t.admin.activeRentals), value: stats.activeRentals, icon: CheckCircle2, color: "text-emerald-500", sub: "" },
              { label: tr(t.admin.pendingApps), value: stats.pendingApplications, icon: Clock, color: "text-yellow-500", sub: "" },
              { label: tr(t.admin.revenue), value: formatUzs(stats.totalRevenueUzs), icon: DollarSign, color: "text-primary", sub: formatUzs(stats.monthlyRevenueUzs) },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-3 sm:p-4"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-sm sm:text-lg font-bold text-foreground break-all">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                {stat.sub && <p className="text-xs text-muted-foreground/60 mt-1">{stat.sub}</p>}
              </motion.div>
            ))}
          </div>
        )}

        <Tabs defaultValue="users">
          <div className="overflow-x-auto -mx-4 px-4 mb-6">
            <TabsList className="w-max min-w-full sm:w-auto">
              <TabsTrigger value="users" data-testid="tab-users" className="text-xs sm:text-sm">{tr(t.admin.users)} ({users.length})</TabsTrigger>
              <TabsTrigger value="listings" data-testid="tab-listings" className="text-xs sm:text-sm">{tr(t.listings.listingsCount)} ({listings.length})</TabsTrigger>
              <TabsTrigger value="applications" data-testid="tab-applications" className="text-xs sm:text-sm">{tr(t.nav.applications)} ({applications.length})</TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments" className="text-xs sm:text-sm">{tr(t.admin.payments)} ({payments.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.id)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.name)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.email)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.role)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.verified)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.phone)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-user-${user.id}`}>
                        <td className="px-4 py-3 font-mono text-xs">{user.id}</td>
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={
                            user.role === "admin" ? "text-red-700 border-red-200 bg-red-50" :
                            user.role === "owner" ? "text-blue-700 border-blue-200 bg-blue-50" :
                            "text-green-700 border-green-200 bg-green-50"
                          }>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {user.verified ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground/40" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.phone || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.id)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.title2)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.district)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.price)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.plan)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.status)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.owner)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.actions)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listings.map(listing => (
                      <tr key={listing.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-listing-${listing.id}`}>
                        <td className="px-4 py-3 font-mono text-xs">{listing.id}</td>
                        <td className="px-4 py-3 font-medium max-w-[200px] truncate">{listing.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{listing.district}</td>
                        <td className="px-4 py-3 font-medium">{formatUzs(listing.priceUzs)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={listing.plan === "pro" ? "text-yellow-700 border-yellow-200 bg-yellow-50" : ""}>
                            {listing.plan}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={listing.status === "active" ? "text-green-700 border-green-200 bg-green-50" : "text-gray-600"}>
                            {listing.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{listing.ownerName}</td>
                        <td className="px-4 py-3">
                          <Link href={`/listings/${listing.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                              <Eye className="w-3 h-3" /> {tr(t.admin.view)}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.id)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.tenant)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.listing)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.moveIn)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.duration)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.status)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.created)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{app.id}</td>
                        <td className="px-4 py-3 font-medium">{app.tenantName}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{app.listingTitle}</td>
                        <td className="px-4 py-3 text-muted-foreground">{app.moveInDate}</td>
                        <td className="px-4 py-3">{app.durationMonths} {tr(t.myApps.months)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={
                            app.status === "approved" ? "text-green-700 border-green-200 bg-green-50" :
                            app.status === "pending" ? "text-yellow-700 border-yellow-200 bg-yellow-50" :
                            app.status === "rejected" ? "text-red-700 border-red-200 bg-red-50" :
                            "text-gray-600"
                          }>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(app.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.id)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.period)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.rent)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.fee)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.total)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.method)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.status)}</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tr(t.admin.confirmed)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{payment.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">{payment.period}</td>
                        <td className="px-4 py-3 font-medium">{formatUzs(payment.amountUzs)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatUzs(payment.serviceFeeUzs)}</td>
                        <td className="px-4 py-3 font-bold">{formatUzs(payment.totalUzs)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{payment.method}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={
                            payment.status === "completed" ? "text-green-700 border-green-200 bg-green-50" :
                            payment.status === "pending" ? "text-yellow-700 border-yellow-200 bg-yellow-50" :
                            "text-red-700 border-red-200 bg-red-50"
                          }>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {payment.ownerConfirmed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground/40" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
