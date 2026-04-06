import { Link } from "wouter";
import { Clock, CheckCircle2, XCircle, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetApplications } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { formatUzs, trText } from "@/lib/utils";
import { motion } from "framer-motion";
import { useI18n, useT } from "@/lib/i18n";

export function MyApplications() {
  const { userId } = useRole();
  const { data: applications, isLoading } = useGetApplications({ tenantId: userId });
  const { t, lang } = useI18n();
  const { tr } = useT();

  const statusConfigs: Record<string, { label: string; className: string }> = {
    pending: { label: tr(t.myApps.pending), className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    approved: { label: tr(t.myApps.approved), className: "bg-green-50 text-green-700 border-green-200" },
    rejected: { label: tr(t.myApps.rejected), className: "bg-red-50 text-red-700 border-red-200" },
    cancelled: { label: tr(t.myApps.cancelled), className: "bg-gray-50 text-gray-600 border-gray-200" },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">{tr(t.myApps.title)}</h1>
        <p className="text-muted-foreground mb-8">{tr(t.myApps.subtitle)}</p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : !applications || applications.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <p className="text-lg font-medium text-foreground mb-2">{tr(t.myApps.noApps)}</p>
            <p className="text-muted-foreground text-sm mb-6">{tr(t.myApps.startBrowsing)}</p>
            <Link href="/listings">
              <Button data-testid="button-browse-listings">{tr(t.myApps.browseListings)}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, i) => {
              const config = statusConfigs[app.status] ?? { label: app.status, className: "" };
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-5"
                  data-testid={`card-application-${app.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="outline" className={config.className}>{config.label}</Badge>
                        {app.status === "approved" && (
                          <Link href={`/my/contract/${app.id}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                              {tr(t.myApps.viewContract)} <ArrowRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{trText(app.listingTitle, lang)}</h3>
                    </div>
                    {app.priceUzs && (
                      <p className="text-primary font-bold text-sm sm:text-base sm:text-right flex-shrink-0">{formatUzs(Math.round(app.priceUzs * 1.05))}{tr(t.common.perMonth)}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {app.district && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {app.district}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {tr(t.myApps.moveIn)}: {app.moveInDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {app.durationMonths} {tr(t.myApps.months)}
                    </span>
                  </div>

                  {app.note && (
                    <div className="mt-3 bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                      <span className="font-medium">{tr(t.myApps.ownerNote)} </span>{app.note}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
