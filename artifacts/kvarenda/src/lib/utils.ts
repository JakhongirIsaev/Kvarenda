import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const TASHKENT_TZ = "Asia/Tashkent";

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

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("ru-RU", { timeZone: TASHKENT_TZ });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("ru-RU", { timeZone: TASHKENT_TZ });
}

export function nowTashkent(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TASHKENT_TZ }));
}
