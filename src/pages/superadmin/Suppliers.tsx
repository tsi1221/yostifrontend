// src/pages/superAdmin/Suppliers.tsx
import { useState } from "react";
import { Modal, Input, Button, Select, message } from "antd";

const { Option } = Select;

interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  verified: boolean;
  createdAt: string;
}

const initialSuppliers: Supplier[] = [
  {
    id: "SUP001",
    companyName: "ABC Textiles",
    contactPerson: "John Doe",
    phone: "0912345678",
    email: "abc@textiles.com",
    address: "123 Main St",
    city: "Addis Ababa",
    province: "Addis Ababa",
    verified: false,
    createdAt: "2025-10-01",
  },
  {
    id: "SUP002",
    companyName: "Yiwu Coffee Co.",
    contactPerson: "Jane Smith",
    phone: "0911223344",
    email: "yiwu@coffee.com",
    address: "456 Coffee Rd",
    city: "Addis Ababa",
    province: "Addis Ababa",
    verified: true,
    createdAt: "2025-11-05",
  },
];

export default function AllSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [search, setSearch] = useState("");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, "id" | "createdAt">>({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    verified: false,
  });

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    message.success("Supplier deleted successfully");
  };

  const handleVerifyToggle = () => {
    if (!selectedSupplier) return;
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === selectedSupplier.id ? { ...s, verified: !s.verified } : s
      )
    );
    setSelectedSupplier((prev) =>
      prev ? { ...prev, verified: !prev.verified } : null
    );
    message.success(
      selectedSupplier?.verified ? "Supplier unverified" : "Supplier verified"
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSupplier) return;
    const { name, value } = e.target;
    setSelectedSupplier({ ...selectedSupplier, [name]: value });
  };

  const handleSave = () => {
    if (!selectedSupplier) return;
    setSuppliers((prev) =>
      prev.map((s) => (s.id === selectedSupplier.id ? selectedSupplier : s))
    );
    message.success("Supplier updated successfully");
    setEditMode(false);
  };

  const handleNewSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSupplier({ ...newSupplier, [name]: value });
  };

  const handleAddSupplier = () => {
    const emptyField = Object.values(newSupplier).some((v) => v === "");
    if (emptyField) {
      message.error("All fields are required!");
      return;
    }
    const newId = `SUP${(suppliers.length + 1).toString().padStart(3, "0")}`;
    setSuppliers([
      ...suppliers,
      { ...newSupplier, id: newId, createdAt: new Date().toISOString().split("T")[0] },
    ]);
    message.success("Supplier added successfully");
    setAddModalOpen(false);
    setNewSupplier({
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      province: "",
      verified: false,
    });
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filterVerified === "all"
        ? true
        : filterVerified === "verified"
        ? s.verified
        : !s.verified;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Suppliers (Verify)</h1>
      <p className="text-gray-600 mb-4">Manage all supplier details and verification status</p>

      {/* Top Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <div className="flex gap-2 w-full md:w-2/3">
          <Input
            placeholder="Search by company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filterVerified}
            onChange={(value) => setFilterVerified(value)}
            className="w-48"
          >
            <Option value="all">All</Option>
            <Option value="verified">Verified</Option>
            <Option value="unverified">Unverified</Option>
          </Select>
        </div>
        <Button style={{ backgroundColor: "#0F3952", color: "white" }} onClick={() => setAddModalOpen(true)}>
          Add Supplier
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact Person</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Verified</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No suppliers found.
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((s, idx) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.companyName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.contactPerson}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.email}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    {s.verified ? (
                      <span className="px-2 py-1 rounded-full text-white text-xs bg-green-600">Verified</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-white text-xs bg-red-600">Unverified</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <Button
                      size="small"
                      style={{ backgroundColor: "#0F3952", color: "white" }}
                      onClick={() => handleView(s)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View/Edit Modal */}
      <Modal
        title="Supplier Details"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        bodyStyle={{ backgroundColor: "white" }}
      >
        {selectedSupplier && (
          <div className="flex flex-col gap-3">
            {editMode ? (
              <>
                <Input name="companyName" placeholder="Company Name" value={selectedSupplier.companyName} onChange={handleInputChange} />
                <Input name="contactPerson" placeholder="Contact Person" value={selectedSupplier.contactPerson} onChange={handleInputChange} />
                <Input name="phone" placeholder="Phone" value={selectedSupplier.phone} onChange={handleInputChange} />
                <Input name="email" placeholder="Email" value={selectedSupplier.email} onChange={handleInputChange} />
                <Input name="address" placeholder="Address" value={selectedSupplier.address} onChange={handleInputChange} />
                <Input name="city" placeholder="City" value={selectedSupplier.city} onChange={handleInputChange} />
                <Input name="province" placeholder="Province" value={selectedSupplier.province} onChange={handleInputChange} />
                <div className="flex gap-2 mt-2">
                  <Button style={{ backgroundColor: "#0F3952", color: "white" }} onClick={handleSave}>Save</Button>
                  <Button onClick={() => setEditMode(false)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <p><strong>Company Name:</strong> {selectedSupplier.companyName}</p>
                <p><strong>Contact Person:</strong> {selectedSupplier.contactPerson}</p>
                <p><strong>Phone:</strong> {selectedSupplier.phone}</p>
                <p><strong>Email:</strong> {selectedSupplier.email}</p>
                <p><strong>Address:</strong> {selectedSupplier.address}</p>
                <p><strong>City:</strong> {selectedSupplier.city}</p>
                <p><strong>Province:</strong> {selectedSupplier.province}</p>
                <p><strong>Verified:</strong> {selectedSupplier.verified ? "Yes" : "No"}</p>
                <p><strong>Created At:</strong> {selectedSupplier.createdAt}</p>

                <div className="flex gap-2 mt-2">
                  <Button
                    style={{ backgroundColor: selectedSupplier.verified ? "#888" : "#28a745", color: "white" }}
                    onClick={handleVerifyToggle}
                  >
                    {selectedSupplier.verified ? "Unverify" : "Verify"}
                  </Button>
                  <Button style={{ backgroundColor: "#0F3952", color: "white" }} onClick={() => setEditMode(true)}>Edit</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        title="Add New Supplier"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
        bodyStyle={{ backgroundColor: "white" }}
      >
        <div className="flex flex-col gap-3">
          <Input name="companyName" placeholder="Company Name" value={newSupplier.companyName} onChange={handleNewSupplierChange} />
          <Input name="contactPerson" placeholder="Contact Person" value={newSupplier.contactPerson} onChange={handleNewSupplierChange} />
          <Input name="phone" placeholder="Phone" value={newSupplier.phone} onChange={handleNewSupplierChange} />
          <Input name="email" placeholder="Email" value={newSupplier.email} onChange={handleNewSupplierChange} />
          <Input name="address" placeholder="Address" value={newSupplier.address} onChange={handleNewSupplierChange} />
          <Input name="city" placeholder="City" value={newSupplier.city} onChange={handleNewSupplierChange} />
          <Input name="province" placeholder="Province" value={newSupplier.province} onChange={handleNewSupplierChange} />
          <div className="flex gap-2 mt-2">
            <Button style={{ backgroundColor: "#0F3952", color: "white" }} onClick={handleAddSupplier}>Add Supplier</Button>
            <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
