export type StatusTone = "green" | "yellow" | "red" | "navy" | "slate";

export const STATUS_TONE: Record<string, StatusTone> = {
  approved: "green",
  completed: "green",
  refunded: "navy",
  delivered: "green",
  resolved: "green",
  verified: "green",
  active: "green",
  accept: "green",
  accepted: "green",
  pending: "yellow",
  open: "yellow",
  quoted: "yellow",
  "in transit": "yellow",
  "at port": "yellow",
  customs: "yellow",
  scheduled: "yellow",
  planned: "slate",
  "in progress": "yellow",
  ongoing: "green",
  booked: "yellow",

  medium: "yellow",
  rejected: "red",
  reject: "red",
  failed: "red",
  closed: "red",
  inactive: "red",
  disabled: "red",
  removed: "red",
  high: "red",
  low: "slate",
  sea: "navy",
  air: "navy",
  express: "slate",
  SUPER_ADMIN: "navy",
  STAFF: "navy",
  BUYER: "navy",
  SUPPLIER: "navy",
  LOGISTICS_PARTNER: "slate",
};

export const BADGE_TONE_CLASS: Record<StatusTone, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  navy: "bg-[#0F3952]/10 text-[#0F3952]",
  slate: "bg-slate-100 text-slate-600",
};

export const SELECT_TONE_CLASS: Record<StatusTone, string> = {
  green: "!border-green-600 !bg-green-600 !text-white",
  yellow: "!border-yellow-400 !bg-yellow-400 !text-slate-900",
  red: "!border-red-600 !bg-red-600 !text-white",
  navy: "!border-[#0F3952] !bg-[#0F3952] !text-white",
  slate: "!border-slate-400 !bg-slate-400 !text-white",
};

export function getStatusTone(value: string): StatusTone | null {
  return STATUS_TONE[value] ?? STATUS_TONE[value.toLowerCase()] ?? null;
}
