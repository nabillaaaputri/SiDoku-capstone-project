import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatRupiahCompact(value: number): string {
  const absoluteValue = Math.abs(value);
  const formatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  });

  if (absoluteValue < 1000) {
    return `Rp ${formatter.format(value)}`;
  }

  if (absoluteValue < 1_000_000) {
    return `Rp ${formatter.format(value / 1000)}rb`;
  }

  if (absoluteValue < 1_000_000_000) {
    return `Rp ${formatter.format(value / 1_000_000)}jt`;
  }

  if (absoluteValue < 1_000_000_000_000) {
    return `Rp ${formatter.format(value / 1_000_000_000)}miliar`;
  }

  return `Rp ${formatter.format(value / 1_000_000_000_000)}triliun`;
}
