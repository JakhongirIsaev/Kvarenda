import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, FileText, CheckCircle2, Download, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetContract, useSignContract } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { formatUzs, formatDate, trText } from "@/lib/utils";
import { motion } from "framer-motion";
import { useI18n, useT } from "@/lib/i18n";

export function ContractView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { role, userId } = useRole();
  const { toast } = useToast();
  const [payingFirst, setPayingFirst] = useState(false);
  const { t, lang } = useI18n();
  const { tr } = useT();

  const { data: contract, isLoading, refetch } = useGetContract(Number(id), {
    query: { enabled: !!id && !isNaN(Number(id)), queryKey: ["getContract", Number(id)] }
  });

  const signContractMutation = useSignContract();

  const handleSign = async () => {
    try {
      await signContractMutation.mutateAsync({
        id: Number(id),
        data: { role: role === "tenant" ? "tenant" : "owner" }
      });
      await refetch();
      toast({ title: tr(t.contract.contractSigned), description: tr(t.contract.signatureRecorded) });
    } catch {
      toast({ title: tr(t.common.error), description: tr(t.contract.signError), variant: "destructive" });
    }
  };

  const isSignedByTenant = contract?.tenantSigned;
  const isSignedByOwner = contract?.ownerSigned;
  const fullyExecuted = isSignedByTenant && isSignedByOwner;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">{tr(t.contract.notFound)}</p>
      </div>
    );
  }

  const totalMonthly = Math.round(contract.monthlyRentUzs * (1 + contract.serviceFeePercent / 100));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
            {tr(t.contract.back)}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Download className="w-4 h-4" />
            {tr(t.contract.print)}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="bg-primary/5 border-b border-border p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Kvarenda</span>
            </div>
            <h1 className="text-xl font-bold mb-1">{tr(t.contract.rentalAgreement)}</h1>
            <p className="text-sm text-muted-foreground">{tr(t.contract.contractId)} #{contract.id}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              {fullyExecuted ? (
                <Badge className="bg-green-500 text-white border-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> {tr(t.contract.fullyExecuted)}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-700 border-yellow-200">
                  {tr(t.contract.pendingSignatures)}
                </Badge>
              )}
              <Badge variant="outline">{contract.status}</Badge>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{tr(t.contract.ownerLandlord)}</p>
                <p className="font-medium">{contract.ownerName ?? tr(t.owner.title)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{tr(t.contract.tenantRenter)}</p>
                <p className="font-medium">{contract.tenantName ?? tr(t.nav.tenant)}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{tr(t.contract.property)}</p>
              <p className="font-medium">{trText(contract.listingTitle, lang)}</p>
              {contract.address && <p className="text-sm text-muted-foreground">{contract.address}</p>}
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{tr(t.contract.rentalPeriod)}</p>
              <p className="font-medium">{contract.startDate} — {contract.endDate}</p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{tr(t.contract.financialTerms)}</p>
              <div className="flex justify-between text-sm">
                <span>{tr(t.contract.monthlyRent)}</span>
                <span className="font-medium">{formatUzs(totalMonthly)}</span>
              </div>
              {contract.depositUzs > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{tr(t.contract.securityDeposit)}</span>
                  <span className="font-medium text-muted-foreground">{formatUzs(contract.depositUzs)}</span>
                </div>
              )}
            </div>

            {contract.terms && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{tr(t.contract.additionalTerms)}</p>
                <p className="text-sm text-muted-foreground">{contract.terms}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">{tr(t.contract.standardTerms)}</p>
              <p>{tr(t.contract.standardText1)}</p>
              <p>{tr(t.contract.standardText2)}</p>
              <p>{tr(t.contract.standardText3)}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6">
              <div className="border border-border rounded-xl p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">{tr(t.contract.ownerSignature)}</p>
                {isSignedByOwner ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">{tr(t.contract.signed)}</p>
                      {contract.ownerSignedAt && (
                        <p className="text-xs text-muted-foreground">{formatDate(contract.ownerSignedAt)}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="h-12 border-b border-dashed border-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">{tr(t.contract.notSigned)}</p>
                    {role === "owner" && (
                      <Button
                        size="sm"
                        className="mt-2 h-8 text-xs"
                        onClick={handleSign}
                        disabled={signContractMutation.isPending}
                        data-testid="button-sign-owner"
                      >
                        {tr(t.contract.signAsOwner)}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="border border-border rounded-xl p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">{tr(t.contract.tenantSignature)}</p>
                {isSignedByTenant ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">{tr(t.contract.signed)}</p>
                      {contract.tenantSignedAt && (
                        <p className="text-xs text-muted-foreground">{formatDate(contract.tenantSignedAt)}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="h-12 border-b border-dashed border-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">{tr(t.contract.notSigned)}</p>
                    {role === "tenant" && (
                      <Button
                        size="sm"
                        className="mt-2 h-8 text-xs"
                        onClick={handleSign}
                        disabled={signContractMutation.isPending}
                        data-testid="button-sign-tenant"
                      >
                        {tr(t.contract.signAsTenant)}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-xs text-center text-muted-foreground">
              {tr(t.contract.legalFooter)} {tr(t.contract.contractId)} ID: {contract.id}
            </div>

            {fullyExecuted && role === "tenant" && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <CreditCard className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{tr(t.contract.firstPaymentTitle)}</h3>
                <p className="text-sm text-muted-foreground mb-3">{tr(t.contract.firstPaymentDesc)}</p>
                <div className="bg-card rounded-lg p-3 mb-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>{tr(t.contract.monthlyRent)}</span>
                    <span className="font-medium">{formatUzs(contract.monthlyRentUzs)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{tr(t.contract.serviceFee)}</span>
                    <span>{formatUzs(Math.round(contract.monthlyRentUzs * 0.05))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>{tr(t.contract.totalDue)}</span>
                    <span className="text-primary">{formatUzs(totalMonthly)}</span>
                  </div>
                </div>
                <Button
                  className="w-full h-12 text-base gap-2"
                  disabled={payingFirst}
                  onClick={async () => {
                    setPayingFirst(true);
                    try {
                      const res = await fetch("/api/payments/first-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ contractId: contract.id, tenantId: userId, method: "online" }),
                      });
                      if (res.ok) {
                        toast({ title: tr(t.contract.paymentSuccess), description: tr(t.contract.rentalActivated) });
                        setLocation("/my/rental");
                      } else {
                        const data = await res.json();
                        toast({ title: tr(t.common.error), description: data.error, variant: "destructive" });
                      }
                    } catch {
                      toast({ title: tr(t.common.error), variant: "destructive" });
                    } finally {
                      setPayingFirst(false);
                    }
                  }}
                  data-testid="button-first-payment"
                >
                  <CreditCard className="w-5 h-5" />
                  {payingFirst ? tr(t.rental.processing) : tr(t.contract.payFirstMonth)}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
