// src/data/support.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  details: string;
  status: 'Open' | 'Pending' | 'Closed';
  createdAt: string;
  product: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  sender: 'User' | 'Admin';
  message: string;
  time: string;
}

export const users: User[] = [
  { id: 'u1', name: 'Mimi Tesfaye', email: 'mimi@example.com' },
  { id: 'u2', name: 'Abel Kassa', email: 'abel@example.com' },
  { id: 'u3', name: 'Tsehay Nesh', email: 'tsehay@example.com' },
  { id: 'u4', name: 'Hanna Dinku', email: 'hanna@example.com' },
  { id: 'u5', name: 'Biniam Sorsa', email: 'biniam@example.com' },
];

const priorities: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

export const supportTickets: SupportTicket[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `T${1000 + i}`,
  userId: users[i % users.length].id,
  subject: `Issue with Product ${i + 1}`,
  details: `User reported an issue regarding Product ${i + 1}.`,
  status: i % 3 === 0 ? 'Closed' : i % 2 === 0 ? 'Pending' : 'Open',
  createdAt: `2025-11-${(i % 28) + 1}`,
  product: `Product-${i + 1}`,
  priority: priorities[i % 3],
}));

export const chatMessages: ChatMessage[] = [
  { id: 'c1', ticketId: 'T1000', sender: 'User', message: 'Hello, I need help with my order.', time: '2025-11-01 10:00 AM' },
  { id: 'c2', ticketId: 'T1000', sender: 'Admin', message: 'Sure! Can you share your order ID?', time: '2025-11-01 10:05 AM' },
  { id: 'c3', ticketId: 'T1000', sender: 'User', message: 'It’s ORD-234.', time: '2025-11-01 10:10 AM' },
];
