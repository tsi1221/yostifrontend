import  { useState } from "react";
import { Modal, Button, Input } from "antd";

interface SupplierQuote {
  id: string;
  requestId: string;
  supplierName: string;
  productName: string;
  price: number;
  moq: number;
  leadTime: string;
  notes: string;
  createdAt: string;
}

interface ChatMessage {
  sender: "buyer" | "supplier";
  content: string;
  timestamp: string;
}

const initialQuotes: SupplierQuote[] = [
  {
    id: "Q001",
    requestId: "SR001",
    supplierName: "Supplier A",
    productName: "Coffee Beans",
    price: 480,
    moq: 50,
    leadTime: "14 days",
    notes: "Includes shipping to Ethiopia",
    createdAt: "2025-10-02 05:00",
  },
  {
    id: "Q002",
    requestId: "SR002",
    supplierName: "Supplier B",
    productName: "Mobile Phones",
    price: 14800,
    moq: 20,
    leadTime: "10 days",
    notes: "Unlocked, 1-year warranty",
    createdAt: "2025-11-22 10:30",
  },
];

const initialChat: { [quoteId: string]: ChatMessage[] } = {
  Q001: [
    { sender: "buyer", content: "Hi Supplier A, please confirm shipping.", timestamp: "2025-10-02 05:00" },
    { sender: "supplier", content: "Yes, shipping included to Ethiopia.", timestamp: "2025-10-02 05:05" },
  ],
  Q002: [
    { sender: "buyer", content: "Can you deliver 20 units?", timestamp: "2025-11-22 10:35" },
    { sender: "supplier", content: "Yes, delivery will take 10 days.", timestamp: "2025-11-22 10:40" },
  ],
};

export default function SupplierQuotes() {
  const [quotes] = useState<SupplierQuote[]>(initialQuotes);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const itemsPerPage = 5;

  const filteredQuotes = quotes.filter(
    (q) =>
      q.productName.toLowerCase().includes(search.toLowerCase()) ||
      q.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleView = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setViewModalOpen(true);
  };

  const openChat = () => {
    if (selectedQuote) {
      setChatMessages(initialChat[selectedQuote.id] || []);
      setChatModalOpen(true);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const message: ChatMessage = {
      sender: "buyer",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Supplier Quotes</h1>
        <p className="text-gray-600">View all supplier quotes submitted for sourcing requests</p>
      </div>

      {/* Search */}
      <div className="mb-4 w-full md:w-1/3">
        <input
          type="text"
          placeholder="Search by product or supplier..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quote ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Request ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">MOQ</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lead Time</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedQuotes.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">No quotes found.</td>
              </tr>
            ) : (
              paginatedQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{quote.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{quote.requestId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{quote.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{quote.productName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">${quote.price}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{quote.moq}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{quote.leadTime}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{quote.notes}</td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="small"
                      style={{ backgroundColor: "#0F3952", color: "white" }}
                      onClick={() => handleView(quote)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end items-center gap-2">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          style={{ backgroundColor: "#0F3952", color: "white" }}
        >
          Previous
        </Button>
        <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{ backgroundColor: "#0F3952", color: "white" }}
        >
          Next
        </Button>
      </div>

      {/* View Modal */}
      <Modal
        title="Supplier Quote Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        bodyStyle={{ backgroundColor: "white" }}
      >
        {selectedQuote && (
          <div className="flex flex-col gap-4">
            <div className="p-3 border rounded-lg bg-gray-50">
              <p><strong>Quote ID:</strong> {selectedQuote.id}</p>
              <p><strong>Request ID:</strong> {selectedQuote.requestId}</p>
              <p><strong>Supplier:</strong> {selectedQuote.supplierName}</p>
              <p><strong>Product:</strong> {selectedQuote.productName}</p>
              <p><strong>Price:</strong> ${selectedQuote.price}</p>
              <p><strong>MOQ:</strong> {selectedQuote.moq}</p>
              <p><strong>Lead Time:</strong> {selectedQuote.leadTime}</p>
              <p><strong>Notes:</strong> {selectedQuote.notes}</p>
              <p><strong>Created At:</strong> {selectedQuote.createdAt}</p>
            </div>

            <Button
              style={{ backgroundColor: "#0F3952", color: "white" }}
              onClick={openChat}
            >
              View Chat with {selectedQuote.supplierName}
            </Button>
          </div>
        )}
      </Modal>

      {/* Chat Modal */}
      <Modal
        title={selectedQuote ? `Chat with ${selectedQuote.supplierName}` : "Chat"}
        open={chatModalOpen}
        onCancel={() => setChatModalOpen(false)}
        footer={null}
        bodyStyle={{ backgroundColor: "white" }}
      >
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded ${msg.sender === "buyer" ? "bg-blue-200 self-start" : "bg-green-200 self-end"}`}
            >
              <p className="text-sm"><strong>{msg.sender === "buyer" ? "Buyer" : "Supplier"}:</strong> {msg.content}</p>
              <span className="text-xs text-gray-600">{msg.timestamp}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <Button type="primary" onClick={handleSendMessage} style={{ backgroundColor: "#0F3952", color: "white" }}>
            Send
          </Button>
        </div>
      </Modal>
    </div>
  );
}
