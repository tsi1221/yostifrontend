// src/pages/superAdmin/SourcingRequests.tsx
import { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Drawer, Button, Input, Checkbox, Modal, type CheckboxChangeEvent } from "antd";

interface SourcingRequest {
  id: string;
  userName: string;
  productName: string;
  description: string;
  quantity: number;
  targetPrice: number;
  supplierRegion: string;
  sampleRequired: boolean;
  createdAt: string;
  deadline?: string;
}

interface FormData {
  userName: string;
  productName: string;
  description: string;
  quantity: string;
  targetPrice: string;
  supplierRegion: string;
  sampleRequired: boolean;
  deadline: string;
}

let requestIdCounter = 7;

const initialRequests: SourcingRequest[] = [
  {
    id: "SR001",
    userName: "John Doe",
    productName: "Coffee Beans",
    description: "High quality Arabica",
    quantity: 100,
    targetPrice: 500,
    supplierRegion: "Yiwu",
    sampleRequired: true,
    createdAt: "2025-11-24",
  },
  {
    id: "SR002",
    userName: "Alice Smith",
    productName: "Mobile Phones",
    description: "Latest model, unlocked",
    quantity: 50,
    targetPrice: 15000,
    supplierRegion: "Shenzhen",
    sampleRequired: false,
    createdAt: "2025-11-22",
  },
];

export default function SourcingRequests() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [requests, setRequests] = useState<SourcingRequest[]>(initialRequests);
  const [editingRequest, setEditingRequest] = useState<SourcingRequest | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState<SourcingRequest | null>(null);
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    productName: "",
    description: "",
    quantity: "",
    targetPrice: "",
    supplierRegion: "",
    sampleRequired: false,
    deadline: "",
  });

  const itemsPerPage = 5;

  const filteredRequests = requests.filter(
    (req) =>
      req.productName.toLowerCase().includes(search.toLowerCase()) ||
      req.userName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingRequest) {
      setEditingRequest({ ...editingRequest, [name]: value } as SourcingRequest);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: CheckboxChangeEvent) => {
    const { name, checked } = e.target as unknown as { name: string; checked: boolean };
    if (editingRequest) {
      setEditingRequest({ ...editingRequest, [name]: checked } as SourcingRequest);
    } else {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    }
  };

  const validateForm = (data: SourcingRequest | FormData) => {
    return data.userName && data.productName && data.quantity && data.targetPrice && data.supplierRegion;
  };

  const handleCreateRequest = () => {
    if (!validateForm(formData)) return;

    const newReq: SourcingRequest = {
      id: `SR${String(requestIdCounter).padStart(3, "0")}`,
      userName: formData.userName,
      productName: formData.productName,
      description: formData.description,
      quantity: Number(formData.quantity),
      targetPrice: Number(formData.targetPrice),
      supplierRegion: formData.supplierRegion,
      sampleRequired: formData.sampleRequired,
      createdAt: new Date().toISOString().split("T")[0],
      deadline: formData.deadline || undefined,
    };

    setRequests([newReq, ...requests]);
    requestIdCounter++;
    setDrawerOpen(false);
    setFormData({ userName: "", productName: "", description: "", quantity: "", targetPrice: "", supplierRegion: "", sampleRequired: false, deadline: "" });
  };

  const handleSaveEdit = () => {
    if (!editingRequest) return;
    if (!validateForm(editingRequest)) return;
    setRequests(requests.map((r) => (r.id === editingRequest.id ? editingRequest : r)));
    setDrawerOpen(false);
  };

  const handleViewRequest = (req: SourcingRequest) => {
    setViewRequest(req);
    setViewModalOpen(true);
  };
  const handleEditRequest = (req: SourcingRequest) => {
    setEditingRequest(req);
    setDrawerOpen(true);
  };
  const handleDeleteRequest = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Sourcing Requests</h1>
          <p className="text-gray-600">Manage all sourcing requests from buyers</p>
        </div>
        <Button
          style={{ backgroundColor: "#0F3952", color: "white", border: "none", padding: "8px 16px" }}
          onClick={() => {
            setEditingRequest(null);
            setDrawerOpen(true);
          }}
        >
          + Create Sourcing Request
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-1/3 mb-4">
        <Input
          placeholder="Search by product or user..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          prefix={<SearchOutlined />}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Target Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Region</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sample</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created At</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">No requests found.</td>
              </tr>
            ) : (
              paginatedRequests.map((req, index) => (
                <tr key={req.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.userName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.productName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">${req.targetPrice}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.supplierRegion}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.sampleRequired ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.createdAt}</td>
                  <td className="px-4 py-3 text-sm text-center flex justify-center gap-2">
                    <Button style={{ backgroundColor: "#0F3952", color: "white" }} size="small" onClick={() => handleViewRequest(req)}>View</Button>
                    <Button style={{ backgroundColor: "#FF9900", color: "white" }} size="small" onClick={() => handleEditRequest(req)}>Edit</Button>
                    <Button style={{ backgroundColor: "red", color: "white" }} size="small" onClick={() => handleDeleteRequest(req.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end items-center gap-2">
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
        <span className="px-3 py-1 text-sm font-medium">Page {currentPage} of {totalPages}</span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
      </div>

      {/* Drawer */}
      <Drawer
        title={editingRequest ? "Edit Sourcing Request" : "Create Sourcing Request"}
        placement="right"
        width={400}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        bodyStyle={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px" }}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              style={{ backgroundColor: "#0F3952", color: "white" }}
              onClick={editingRequest ? handleSaveEdit : handleCreateRequest}
              disabled={!validateForm(editingRequest || formData)}
            >
              {editingRequest ? "Save Changes" : "Create"}
            </Button>
          </div>
        }
      >
        <Input name="userName" placeholder="User Name *" value={editingRequest?.userName || formData.userName} onChange={handleInputChange} />
        <Input name="productName" placeholder="Product Name *" value={editingRequest?.productName || formData.productName} onChange={handleInputChange} />
        <Input.TextArea name="description" placeholder="Description" value={editingRequest?.description || formData.description} onChange={handleInputChange} />
        <Input name="quantity" type="number" placeholder="Quantity *" value={editingRequest?.quantity || formData.quantity} onChange={handleInputChange} />
        <Input name="targetPrice" type="number" placeholder="Target Price *" value={editingRequest?.targetPrice || formData.targetPrice} onChange={handleInputChange} />
        <select name="supplierRegion" value={editingRequest?.supplierRegion || formData.supplierRegion} onChange={handleInputChange} className="px-3 py-2 border rounded w-full">
          <option value="">Select Supplier Region *</option>
          <option value="Yiwu">Yiwu</option>
          <option value="Guangzhou">Guangzhou</option>
          <option value="Shenzhen">Shenzhen</option>
          <option value="Other">Other</option>
        </select>
        <Checkbox name="sampleRequired" checked={editingRequest?.sampleRequired || formData.sampleRequired} onChange={handleCheckboxChange}>Sample Required</Checkbox>
        <Input type="date" name="deadline" value={editingRequest?.deadline || formData.deadline} onChange={handleInputChange} />
      </Drawer>

      {/* View Modal */}
      <Modal
        title="Sourcing Request Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
      >
        {viewRequest && (
          <div className="flex flex-col gap-2">
            <p><strong>ID:</strong> {viewRequest.id}</p>
            <p><strong>User:</strong> {viewRequest.userName}</p>
            <p><strong>Product:</strong> {viewRequest.productName}</p>
            <p><strong>Description:</strong> {viewRequest.description}</p>
            <p><strong>Quantity:</strong> {viewRequest.quantity}</p>
            <p><strong>Target Price:</strong> ${viewRequest.targetPrice}</p>
            <p><strong>Region:</strong> {viewRequest.supplierRegion}</p>
            <p><strong>Sample Required:</strong> {viewRequest.sampleRequired ? "Yes" : "No"}</p>
            <p><strong>Created At:</strong> {viewRequest.createdAt}</p>
            {viewRequest.deadline && <p><strong>Deadline:</strong> {viewRequest.deadline}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
