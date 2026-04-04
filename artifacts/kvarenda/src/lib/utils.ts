import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUzs(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export function formatUzsShort(amount: number): string {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace(/\.0$/, "") + " mln so'm";
  }
  return formatUzs(amount);
}
