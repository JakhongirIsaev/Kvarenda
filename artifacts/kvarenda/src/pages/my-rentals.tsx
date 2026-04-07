import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Home, Calendar, FileText, CreditCard, CheckCircle2, Clock, AlertCircle, MessageSquare, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGetTenantDashboard, useGetPayments, useCreatePayment } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { formatUzs, trText } from "@/lib/utils";
import { motion } from "framer-motion";
import { useI18n, useT } from "@/lib/i18n";

export function MyRentals() {
  const { userId } = useRole();
  const { toast } = useToast();
  const [paying, setPaying] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketCategory, setTicketCategory] = useState("other");
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const { t, lang } = useI18n();
  const { tr } = useT();

  useEffect(() => {
    if (userId) {
      fetch(`/api/tickets?userId=${userId}`).then(r => r.json()).then(setTickets).catch(() => {});
    }
  }, [userId]);

  const submitTicket = async () => {
    if (!ticketSubject || !ticketDesc) return;
    setSubmittingTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId,
          rentalId: dashboard?.currentRental?.id,
          category: ticketCategory,
          subject: ticketSubject,
          description: ticketDesc,
        }),
      });
      if (res.ok) {
        toast({ title: tr(t.rental.ticketCreated) });
        setTicketSubject("");
        setTicketDesc("");
        setShowTicketForm(false);
        const updated = await fetch(`/api/tickets?userId=${userId}`).then(r => r.json());
        setTickets(updated);
      }
    } catch {
      toast({ title: tr(t.common.error), variant: "destructive" });
    } finally {
      setSubmittingTicket(false);
    }
  };

  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useGetTenantDashboard(userId);
  const rental = dashboard?.currentRental;

  const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = useGetPayments(
    rental ? { rentalId: rental.id } : undefined,
    { query: { enabled: !!rental?.id, queryKey: ["getPayments", rental?.id] } }
  );

  const createPayment = useCreatePayment();

  const handlePay = async (period: string, amountUzs: number) => {
    if (!rental) return;
    setPaying(true);
    try {
      await createPayment.mutateAsync({
        data: {
          rentalId: rental.id,
          tenantId: userId,
          period,
          amountUzs,
          method: "online",
        }
      });
      await refetchPayments();
      await refetchDashboard();
      toast({ title: tr(t.rental.paymentSubmitted), description: tr(t.rental.paymentSuccess) });
    } catch {
      toast({ title: tr(t.common.error), description: tr(t.rental.paymentError), variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  if (!userId) return null;

  const paymentStatusConfigs: Record<string, { label: string; className: string }> = {
    pending: { label: tr(t.rental.due), className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    declared: { label: tr(t.rental.declared), className: "bg-blue-50 text-blue-700 border-blue-200" },
    completed: { label: tr(t.rental.paid), className: "bg-green-50 text-green-700 border-green-200" },
    failed: { label: tr(t.rental.failed), className: "bg-red-50 text-red-700 border-red-200" },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">{tr(t.rental.title)}</h1>
        <p className="text-muted-foreground mb-8">{tr(t.rental.subtitle)}</p>

        {dashboardLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : !rental ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">{tr(t.rental.noRental)}</p>
            <p className="text-muted-foreground text-sm mb-6">{tr(t.rental.noRentalSub)}</p>
            <Link href="/listings">
              <Button data-testid="button-find-apartment">{tr(t.rental.findApartment)}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="bg-primary/5 border-b border-border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-green-500 text-white border-0">{tr(t.rental.active)}</Badge>
                  </div>
                  <h2 className="font-semibold text-foreground text-lg truncate">{trText(rental.listingTitle, lang)}</h2>
                  <p className="text-muted-foreground text-sm">{rental.district}</p>
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{formatUzs(rental.monthlyRentUzs + rental.serviceFeeUzs)}</p>
                  <p className="text-sm text-muted-foreground">{tr(t.rental.perMonth)}</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{tr(t.rental.startDate)}</p>
                  <p className="font-medium">{rental.startDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{tr(t.rental.endDate)}</p>
                  <p className="font-medium">{rental.endDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{tr(t.rental.monthlyAmount)}</p>
                  <p className="font-medium">{formatUzs(rental.monthlyRentUzs + rental.serviceFeeUzs)}</p>
                </div>
              </div>
            </motion.div>

            {dashboard?.nextPaymentDate && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{tr(t.rental.nextPayment)}</p>
                    <p className="text-xs text-muted-foreground">{dashboard.nextPaymentDate}</p>
                  </div>
                </div>
                <div className="sm:text-right flex items-center sm:flex-col gap-3 sm:gap-0">
                  <p className="font-bold text-primary">{formatUzs(dashboard.nextPaymentAmount ?? 0)}</p>
                  <Button
                    size="sm"
                    className="sm:mt-1 h-8 text-xs"
                    disabled={paying}
                    onClick={() => handlePay(dashboard.nextPaymentDate!, rental.monthlyRentUzs)}
                    data-testid="button-pay-next"
                  >
                    {paying ? tr(t.rental.processing) : tr(t.rental.payNow)}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                <p className="text-sm sm:text-lg font-bold text-foreground break-all">{formatUzs(rental.totalPaid ?? 0)}</p>
                <p className="text-xs text-muted-foreground">{tr(t.rental.totalPaid)}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
                <Clock className="w-5 h-5 text-yellow-500 mb-2" />
                <p className="text-sm sm:text-lg font-bold text-foreground">{rental.paymentsCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">{tr(t.rental.paymentsMade)}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
                <Home className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm sm:text-lg font-bold text-foreground">{rental.protectedRent ? tr(t.rental.active) : tr(t.rental.none)}</p>
                <p className="text-xs text-muted-foreground">{tr(t.rental.rentProtection)}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{tr(t.rental.paymentHistory)}</h3>
                <Link href={`/my/contract/${rental.contractId}`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground text-xs">
                    <FileText className="w-3 h-3" />
                    {tr(t.rental.viewContract)}
                  </Button>
                </Link>
              </div>

              {paymentsLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
                </div>
              ) : !paymentsData || paymentsData.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-sm">{tr(t.rental.noPayments)}</div>
              ) : (
                <div className="divide-y divide-border">
                  {paymentsData.map((payment) => {
                    const pConfig = paymentStatusConfigs[payment.status] ?? { label: payment.status, className: "" };
                    return (
                      <div key={payment.id} className="p-4 flex items-center justify-between" data-testid={`row-payment-${payment.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{formatUzs(payment.totalUzs)}</p>
                            <p className="text-xs text-muted-foreground">
                              {tr(t.rental.period)}: {payment.period} · {payment.method}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={pConfig.className}>{pConfig.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Support Tickets */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {tr(t.rental.support)}
                </h3>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowTicketForm(!showTicketForm)}>
                  {showTicketForm ? tr(t.common.cancel) : tr(t.rental.newTicket)}
                </Button>
              </div>

              {showTicketForm && (
                <div className="p-5 border-b border-border space-y-3 bg-muted/30">
                  <Select value={ticketCategory} onValueChange={setTicketCategory}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">{tr(t.rental.catPayment)}</SelectItem>
                      <SelectItem value="property">{tr(t.rental.catProperty)}</SelectItem>
                      <SelectItem value="contract">{tr(t.rental.catContract)}</SelectItem>
                      <SelectItem value="dispute">{tr(t.rental.catDispute)}</SelectItem>
                      <SelectItem value="other">{tr(t.rental.catOther)}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={tr(t.rental.ticketSubject)}
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Textarea
                    placeholder={tr(t.rental.ticketDesc)}
                    value={ticketDesc}
                    onChange={e => setTicketDesc(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                  <Button size="sm" disabled={submittingTicket || !ticketSubject || !ticketDesc} onClick={submitTicket} className="gap-1">
                    <Send className="w-3 h-3" />
                    {submittingTicket ? tr(t.rental.submitting) : tr(t.rental.submitTicket)}
                  </Button>
                </div>
              )}

              {tickets.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-sm">{tr(t.rental.noTickets)}</div>
              ) : (
                <div className="divide-y divide-border">
                  {tickets.map((ticket: any) => (
                    <div key={ticket.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">{ticket.category} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className={
                        ticket.status === "open" ? "text-yellow-700 border-yellow-200 bg-yellow-50" :
                        ticket.status === "resolved" ? "text-green-700 border-green-200 bg-green-50" :
                        ticket.status === "in_progress" ? "text-blue-700 border-blue-200 bg-blue-50" :
                        "text-gray-600"
                      }>{ticket.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
