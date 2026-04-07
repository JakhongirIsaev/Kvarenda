import { Link } from "wouter";
import { Plus, Home, Users, DollarSign, Building, FileText, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetOwnerDashboard, useGetApplications, useGetListings, useGetRentals, useUpdateApplicationStatus } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { formatUzs, trText } from "@/lib/utils";
import { motion } from "framer-motion";
import { useI18n, useT } from "@/lib/i18n";

export function OwnerDashboard() {
  const { userId, role } = useRole();
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const { tr } = useT();

  const { data: dashboard, isLoading } = useGetOwnerDashboard(userId);
  const { data: applications, refetch: refetchApps } = useGetApplications({ ownerId: userId });
  const { data: listingsData, refetch: refetchListings } = useGetListings({ ownerId: userId, limit: 50 });
  const { data: rentalsData } = useGetRentals({ ownerId: userId });
  const updateApp = useUpdateApplicationStatus();

  const listings = listingsData?.listings ?? [];
  const rentals = rentalsData ?? [];

  const togglePublish = async (id: number, currentlyPublished: boolean) => {
    try {
      await fetch(`/api/listings/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ published: !currentlyPublished }),
      });
      refetchListings();
      toast({ title: currentlyPublished ? tr(t.owner.unpublished) : tr(t.owner.published) });
    } catch {
      toast({ title: tr(t.common.error), variant: "destructive" });
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await updateApp.mutateAsync({ id, data: { status: "approved" } });
      await refetchApps();
      toast({ title: tr(t.owner.approved) });
    } catch {
      toast({ title: tr(t.common.error), description: tr(t.owner.approveError), variant: "destructive" });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await updateApp.mutateAsync({ id, data: { status: "rejected" } });
      await refetchApps();
      toast({ title: tr(t.owner.rejected) });
    } catch {
      toast({ title: tr(t.common.error), description: tr(t.owner.rejectError), variant: "destructive" });
    }
  };

  if (role !== "owner") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">{tr(t.owner.switchOwner)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold">{tr(t.owner.title)}</h1>
            <p className="text-muted-foreground">{tr(t.owner.subtitle)}</p>
          </div>
          <Link href="/owner/listings/new">
            <Button className="gap-2 w-full sm:w-auto" data-testid="button-new-listing">
              <Plus className="w-4 h-4" />
              {tr(t.owner.addListing)}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              { label: tr(t.owner.activeListings), value: dashboard?.activeListings ?? 0, icon: Building },
              { label: tr(t.owner.totalApps), value: dashboard?.totalApplications ?? 0, icon: Users },
              { label: tr(t.owner.activeRentals), value: dashboard?.activeRentals ?? 0, icon: Home },
              { label: tr(t.owner.monthlyIncome), value: formatUzs(dashboard?.monthlyIncomeUzs ?? 0), icon: DollarSign },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-3 sm:p-4"
              >
                <stat.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-base sm:text-xl font-bold text-foreground break-all">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        <Tabs defaultValue="listings">
          <div className="overflow-x-auto -mx-4 px-4 mb-6">
            <TabsList className="w-max min-w-full sm:w-auto">
              <TabsTrigger value="listings" data-testid="tab-listings" className="text-xs sm:text-sm">{tr(t.owner.listings)}</TabsTrigger>
              <TabsTrigger value="applications" data-testid="tab-applications" className="text-xs sm:text-sm">
                {tr(t.owner.totalApps)}
                {(dashboard?.pendingApplications ?? 0) > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {dashboard?.pendingApplications}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rentals" data-testid="tab-rentals" className="text-xs sm:text-sm">{tr(t.owner.rentals)}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="listings">
            {listings.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <Building className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">{tr(t.owner.noListings)}</p>
                <p className="text-sm text-muted-foreground mb-4">{tr(t.owner.noListingsSub)}</p>
                <Link href="/owner/listings/new">
                  <Button>{tr(t.owner.addFirstListing)}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-card border border-border rounded-xl p-4" data-testid={`row-listing-${listing.id}`}>
                    <div className="flex items-start gap-3">
                      {listing.photos?.[0] && (
                        <img src={listing.photos[0]} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-medium text-foreground truncate">{listing.district}</p>
                          <Badge variant="outline" className={`text-xs ${listing.status === "active" ? "text-green-700 border-green-200" : "text-gray-600 border-gray-200"}`}>
                            {listing.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-primary font-semibold">{formatUzs(listing.priceUzs)}{tr(t.common.perMonth)}</p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={listing.published ? "outline" : "default"}
                          className="h-8 px-2 sm:px-3 gap-1 text-xs"
                          onClick={() => togglePublish(listing.id, listing.published)}
                        >
                          {listing.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span className="hidden sm:inline">{listing.published ? tr(t.owner.unpublish) : tr(t.owner.publish)}</span>
                        </Button>
                        <Link href={`/listings/${listing.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 px-2 sm:px-3">{tr(t.common.view)}</Button>
                        </Link>
                        <Link href={`/owner/listings/${listing.id}/edit`}>
                          <Button size="sm" variant="outline" className="h-8 px-2 sm:px-3">{tr(t.common.edit)}</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications">
            {!applications || applications.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
                {tr(t.owner.noApps)}
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="bg-card border border-border rounded-xl p-4" data-testid={`row-app-${app.id}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={
                            app.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                            app.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                            "bg-gray-50 text-gray-600 border-gray-200"
                          }>
                            {app.status}
                          </Badge>
                        </div>
                        <p className="font-medium text-base">{app.tenantName}</p>
                        <p className="text-sm text-muted-foreground truncate">{trText(app.listingTitle, lang)}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          {(app as any).tenantPhone && (
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">{tr(t.owner.phone)}:</span> {(app as any).tenantPhone}
                            </p>
                          )}
                          {(app as any).tenantEmail && (
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">{tr(t.owner.email)}:</span> {(app as any).tenantEmail}
                            </p>
                          )}
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">{tr(t.myApps.moveIn)}:</span> {app.moveInDate} · {app.durationMonths} {tr(t.myApps.months)}
                          </p>
                          {app.purpose && (
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">{tr(t.owner.purpose)}:</span> {app.purpose}
                            </p>
                          )}
                        </div>
                        {app.message && (
                          <div className="mt-3 bg-muted/50 rounded-lg p-3">
                            <p className="text-sm italic text-muted-foreground">"{app.message}"</p>
                          </div>
                        )}
                      </div>
                      {app.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-red-600 hover:text-red-700 border-red-200"
                            onClick={() => handleReject(app.id)}
                            disabled={updateApp.isPending}
                            data-testid={`button-reject-${app.id}`}
                          >
                            {tr(t.owner.reject)}
                          </Button>
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => handleApprove(app.id)}
                            disabled={updateApp.isPending}
                            data-testid={`button-approve-${app.id}`}
                          >
                            {tr(t.owner.approve)}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rentals">
            {rentals.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
                {tr(t.owner.noRentals)}
              </div>
            ) : (
              <div className="space-y-3">
                {rentals.map((rental) => (
                  <div key={rental.id} className="bg-card border border-border rounded-xl p-4" data-testid={`row-rental-${rental.id}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{trText(rental.listingTitle, lang)}</p>
                        <p className="text-sm text-muted-foreground">{tr(t.owner.tenant)}: {rental.tenantName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {rental.startDate} → {rental.endDate}
                        </p>
                      </div>
                      <div className="sm:text-right flex items-center sm:flex-col gap-2 sm:gap-0 flex-shrink-0">
                        <p className="font-bold text-primary text-sm sm:text-base">{formatUzs(rental.monthlyRentUzs)}{tr(t.common.perMonth)}</p>
                        <Badge variant="outline" className="text-green-700 border-green-200 sm:mt-1">{tr(t.rental.active)}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
