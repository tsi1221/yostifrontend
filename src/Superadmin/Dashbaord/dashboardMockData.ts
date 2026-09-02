export type DashboardStatType =
  | "progress"
  | "chart"
  | "verified"
  | "trade";

export interface DashboardStat {
  title: string;
  value: string;
  label: string;
  description: string;
  type: DashboardStatType;
  progress?: number;
  chart?: number[];
}

export const dashboardStats: DashboardStat[] = [
  {
    title: "ACTIVE FREIGHT",
    value: "3",
    label: "On Schedule",
    description: "Ocean & air shipments",
    type: "progress",
    progress: 85,
  },
  {
    title: "OPEN SOURCING RFQs",
    value: "2",
    label: "Open Requests",
    description: "Supplier quotes pending",
    type: "chart",
    chart: [22, 32, 45, 30, 52, 40, 58],
  },
  {
    title: "VERIFIED SUPPLIERS",
    value: "4 / 5",
    label: "Verified",
    description: "Trusted suppliers",
    type: "verified",
  },
  {
    title: "TRADE VOLUME",
    value: "$4.3K",
    label: "Completed",
    description: "Total trade value",
    type: "trade",
  },
];