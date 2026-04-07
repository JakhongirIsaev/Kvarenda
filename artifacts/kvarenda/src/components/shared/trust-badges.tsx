import { Shield, ShieldCheck, Camera, Umbrella } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n, useT } from "@/lib/i18n";

export function VerifiedOwnerBadge() {
  const { t } = useI18n();
  const { tr } = useT();
  return (
    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
      <ShieldCheck className="w-3 h-3 mr-1" />
      {tr(t.badges.verifiedOwner)}
    </Badge>
  );
}

export function ProtectedRentBadge() {
  const { t } = useI18n();
  const { tr } = useT();
  return (
    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
      <Shield className="w-3 h-3 mr-1" />
      {tr(t.badges.protectedRent)}
    </Badge>
  );
}

export function TourBadge() {
  const { t } = useI18n();
  const { tr } = useT();
  return (
    <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-200">
      <Camera className="w-3 h-3 mr-1" />
      {tr(t.badges.tour3d)}
    </Badge>
  );
}

export function InsuranceBadge() {
  const { t } = useI18n();
  const { tr } = useT();
  return (
    <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200">
      <Umbrella className="w-3 h-3 mr-1" />
      {tr(t.badges.insurance)}
    </Badge>
  );
}
