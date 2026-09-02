export type RFQStatus = "OPEN" | "QUOTED" | "COMPLETED";

export interface RFQItem {
  id: string;
  reference: string;
  title: string;
  status: RFQStatus;
  description: string;
  quantity: string;
  targetPrice: string;
  preferredRegion: string;
  buyerCompany: string;
  buyerName: string;
  quotesCount: number;
  deadline: string;
  sampleRequired: string;
}

export const sourcingRFQs: RFQItem[] = [
  {
    id: "1",
    reference: "RFQ-2026-01",
    title: "5.5kVA Off-Grid Hybrid Solar Inverter with MPPT",
    status: "COMPLETED",
    description:
      "300 units of high-efficiency hybrid solar inverters with lithium and lead-acid battery support, LCD display, WiFi monitoring, and CE/RoHS certification.",
    quantity: "300 Units",
    targetPrice: "$215",
    preferredRegion: "Yiwu / Shenzhen",
    buyerCompany: "Blue Nile Electronics & Solar",
    buyerName: "Tadesse Gemechu",
    quotesCount: 2,
    deadline: "2026-09-20",
    sampleRequired: "Yes",
  },
  {
    id: "2",
    reference: "RFQ-2026-02",
    title: "Industrial Heavy-Duty Concrete Vibrators",
    status: "QUOTED",
    description:
      "150 sets of 1.5kW concrete vibrators with 6-meter flexible poker shafts and copper winding motors.",
    quantity: "150 Sets",
    targetPrice: "$85",
    preferredRegion: "Guangzhou",
    buyerCompany: "Kality BuildTech Solutions",
    buyerName: "Abebe Bikila",
    quotesCount: 4,
    deadline: "2026-09-25",
    sampleRequired: "No",
  },
  {
    id: "3",
    reference: "RFQ-2026-03",
    title: "High-Gloss Ceramic Floor Tiles 60x60cm",
    status: "OPEN",
    description:
      "2,000 sqm of premium polished porcelain floor tiles with anti-slip coating.",
    quantity: "2,000 Sqm",
    targetPrice: "$12 / Sqm",
    preferredRegion: "Foshan",
    buyerCompany: "Sheger Property Developers",
    buyerName: "Bethlehem Worku",
    quotesCount: 0,
    deadline: "2026-10-05",
    sampleRequired: "Yes",
  },
];

export const sourcingRegions = [
  "All Regions",
  "Yiwu",
  "Guangzhou",
  "Shenzhen",
  "Foshan",
];

export const sourcingStatuses: Array<"ALL" | RFQStatus> = [
  "ALL",
  "OPEN",
  "QUOTED",
  "COMPLETED",
];