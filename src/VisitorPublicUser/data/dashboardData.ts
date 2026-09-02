// src/data/dashboardData.ts
import {
  TeamOutlined,
  FileTextOutlined,
  TruckOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';

// Metric type
export interface Metric {
  title: string;
  value: string;
  icon: React.ElementType;
}

// Table row type
export interface TableRow {
  key: string;
  productName: string;
  status: string;
  date: string;
}

// Status colors
export const statusColors: Record<string, string> = {
  completed: 'blue',
  'in-progress': 'gold',
  open: 'green',
};

// Metrics data (can later fetch dynamically)
export const metricData: Metric[] = [
  { title: 'Total Users', value: '7', icon: TeamOutlined },
  { title: 'sourcing  Requests', value: '2', icon: FileTextOutlined },
  { title: 'Shipments', value: '1', icon: TruckOutlined },
  { title: 'Revenue (USD)', value: '$16,250', icon: DollarCircleOutlined },
];

// Table data (can later fetch from API)
export const tableData: TableRow[] = [
  { key: '1', productName: 'Bulk White Sesame Seeds', status: 'completed', date: '15/09/2025' },
  { key: '2', productName: 'Sidamo Grade A Coffee Beans', status: 'in-progress', date: '19/10/2025' },
  { key: '3', productName: 'Textile Weaving Machine Parts', status: 'open', date: '21/10/2025' },
  { key: '4', productName: 'Industrial Grade Resin', status: 'completed', date: '01/09/2025' },
  { key: '5', productName: 'Organic Honey Bulk', status: 'in-progress', date: '05/10/2025' },
  { key: '6', productName: 'Cotton Fabric Rolls', status: 'open', date: '12/10/2025' },
  { key: '7', productName: 'Industrial Lubricants', status: 'completed', date: '28/09/2025' },
  { key: '8', productName: 'Ethiopian Spices Pack', status: 'in-progress', date: '18/10/2025' },
  { key: '9', productName: 'Plastic Injection Molds', status: 'open', date: '22/10/2025' },
  { key: '10', productName: 'Vegetable Oil Bulk', status: 'completed', date: '30/09/2025' },
];
