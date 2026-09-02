export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

export const activityLogs: ActivityLog[] = [
  {
    id: "1",
    title: "ACCEPT QUOTE",
    description: "Accepted by buyer for RFQ rfq-2026-01",
    time: "01:57 AM",
    color: "bg-emerald-500",
  },
  {
    id: "2",
    title: "VERIFICATION APPROVAL",
    description: "Reviewed audit report and approved verified factory",
    time: "06:45 AM",
    color: "bg-blue-500",
  },
  {
    id: "3",
    title: "SHIPMENT UPDATE",
    description: "Shipment status updated to customs",
    time: "02:15 AM",
    color: "bg-[#0F3952]",
  },
  {
    id: "4",
    title: "SOURCING ASSIGNMENT",
    description: "RFQ matched with 2 verified factories",
    time: "09:20 AM",
    color: "bg-slate-300",
  },
];