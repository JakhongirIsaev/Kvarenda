import { Shield, ShieldCheck, Camera, Umbrella } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VerifiedOwnerBadge() {
  return (
    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
      <ShieldCheck className="w-3 h-3 mr-1" />
      Verified Owner
    </Badge>
  );
}

export function ProtectedRentBadge() {
  return (
    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
      <Shield className="w-3 h-3 mr-1" />
      Protected Rent
    </Badge>
  );
}

export function TourBadge() {
  return (
    <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-200">
      <Camera className="w-3 h-3 mr-1" />
      3D Tour
    </Badge>
  );
}

export function InsuranceBadge() {
  return (
    <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-orange-200">
      <Umbrella className="w-3 h-3 mr-1" />
      Insurance
    </Badge>
  );
}
