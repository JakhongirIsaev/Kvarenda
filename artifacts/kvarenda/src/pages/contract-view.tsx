import { useParams } from "wouter";
import { ArrowLeft, FileText, CheckCircle2, Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetContract, useSignContract } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { formatUzs } from "@/lib/utils";
import { motion } from "framer-motion";

export function ContractView() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const { toast } = useToast();

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
      toast({ title: "Contract signed!", description: "Your signature has been recorded." });
    } catch {
      toast({ title: "Error", description: "Failed to sign contract.", variant: "destructive" });
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
        <p className="text-muted-foreground">Contract not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Download className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary/5 border-b border-border p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Kvarenda</span>
            </div>
            <h1 className="text-xl font-bold mb-1">RENTAL AGREEMENT</h1>
            <p className="text-sm text-muted-foreground">Contract #{contract.id}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              {fullyExecuted ? (
                <Badge className="bg-green-500 text-white border-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Fully Executed
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-700 border-yellow-200">
                  Pending signatures
                </Badge>
              )}
              <Badge variant="outline">{contract.status}</Badge>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Parties */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Owner (Landlord)</p>
                <p className="font-medium">{contract.ownerName ?? "Owner"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Tenant (Renter)</p>
                <p className="font-medium">{contract.tenantName ?? "Tenant"}</p>
              </div>
            </div>

            <Separator />

            {/* Property */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Property</p>
              <p className="font-medium">{contract.listingTitle}</p>
              {contract.address && <p className="text-sm text-muted-foreground">{contract.address}</p>}
            </div>

            <Separator />

            {/* Terms */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Rental Period</p>
                <p className="font-medium">{contract.startDate} — {contract.endDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Service Fee</p>
                <p className="font-medium">{contract.serviceFeePercent}%</p>
              </div>
            </div>

            {/* Financials */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Financial Terms</p>
              <div className="flex justify-between text-sm">
                <span>Monthly rent</span>
                <span className="font-medium">{formatUzs(contract.monthlyRentUzs)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kvarenda service fee ({contract.serviceFeePercent}%)</span>
                <span className="font-medium text-muted-foreground">{formatUzs(Math.round(contract.monthlyRentUzs * contract.serviceFeePercent / 100))}</span>
              </div>
              {contract.depositUzs > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Security deposit (one-time)</span>
                  <span className="font-medium text-muted-foreground">{formatUzs(contract.depositUzs)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total monthly payment</span>
                <span>{formatUzs(Math.round(contract.monthlyRentUzs * (1 + contract.serviceFeePercent / 100)))}</span>
              </div>
            </div>

            {/* Terms */}
            {contract.terms && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Additional Terms</p>
                <p className="text-sm text-muted-foreground">{contract.terms}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Standard Terms</p>
              <p>This rental agreement is entered into between the owner and tenant named above. Both parties agree to timely monthly payments, property maintenance, and adherence to house rules.</p>
              <p>The {contract.serviceFeePercent}% monthly service fee is charged by Kvarenda for platform services including rent protection, verified owner certification, and payment processing.</p>
              <p>Either party may terminate this contract with 30 days written notice. Early termination may result in forfeiture of security deposit.</p>
            </div>

            <Separator />

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-border rounded-xl p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">Owner Signature</p>
                {isSignedByOwner ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">Signed</p>
                      {contract.ownerSignedAt && (
                        <p className="text-xs text-muted-foreground">{new Date(contract.ownerSignedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="h-12 border-b border-dashed border-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">Not yet signed</p>
                    {role === "owner" && (
                      <Button
                        size="sm"
                        className="mt-2 h-8 text-xs"
                        onClick={handleSign}
                        disabled={signContractMutation.isPending}
                        data-testid="button-sign-owner"
                      >
                        Sign as Owner
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="border border-border rounded-xl p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">Tenant Signature</p>
                {isSignedByTenant ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">Signed</p>
                      {contract.tenantSignedAt && (
                        <p className="text-xs text-muted-foreground">{new Date(contract.tenantSignedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="h-12 border-b border-dashed border-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">Not yet signed</p>
                    {role === "tenant" && (
                      <Button
                        size="sm"
                        className="mt-2 h-8 text-xs"
                        onClick={handleSign}
                        disabled={signContractMutation.isPending}
                        data-testid="button-sign-tenant"
                      >
                        Sign as Tenant
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-xs text-center text-muted-foreground">
              This is a legally binding document generated and secured by Kvarenda. Contract ID: {contract.id}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
