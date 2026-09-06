// src/hooks/useAdminDashboard.ts
import { useState, useEffect, useCallback } from "react";
import api from "../api/api"; 
import { message } from "antd";
import type { Supplier, DashboardStats, User as AdminUser } from "../../pages/Admin/adminTypesDashboard";

export const useAdminDashboard = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSuppliers: 0,
    verifications: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
  }), []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/api/users?limit=100", getAuthHeader());
      // Logic: If res.data is an array use it, else look for res.data.data
      const rawData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUsers(rawData);
    } catch (err: any) {
      message.error("Failed to fetch users");
    }
  }, [getAuthHeader]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api.get("/api/suppliers", getAuthHeader());
      const rawData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setSuppliers(rawData);
    } catch (err: any) {
      message.error("Failed to fetch suppliers");
    }
  }, [getAuthHeader]);

  const fetchStats = useCallback(async () => {
    try {
      const payRes = await api.get("/api/payments", getAuthHeader());
      const paymentList = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
      
      const totalRevenue = paymentList.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

      setStats({
        totalUsers: users.length,
        totalSuppliers: suppliers.length,
        verifications: suppliers.filter((s) => s.verified).length,
        totalPayments: totalRevenue,
      });
    } catch (err) {
      setStats(prev => ({ ...prev, totalUsers: users.length, totalSuppliers: suppliers.length }));
    }
  }, [users, suppliers, getAuthHeader]);

  const updateUser = async (id: string, payload: any) => {
    try {
      await api.put(`/api/users/${id}`, payload, getAuthHeader());
      message.success("User updated");
      fetchUsers();
    } catch (e) { message.error("Update failed"); }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/api/users/${id}`, getAuthHeader());
      message.success("User deleted");
      fetchUsers();
    } catch (e) { message.error("Delete failed"); }
  };

  const updateSupplier = async (id: string, payload: any) => {
    try {
      await api.put(`/api/suppliers/${id}`, payload, getAuthHeader());
      message.success("Supplier updated");
      fetchSuppliers();
    } catch (e) { message.error("Update failed"); }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await api.delete(`/api/suppliers/${id}`, getAuthHeader());
      message.success("Supplier deleted");
      fetchSuppliers();
    } catch (e) { message.error("Delete failed"); }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchSuppliers()]);
      setLoading(false);
    };
    init();
  }, [fetchUsers, fetchSuppliers]);

  useEffect(() => { fetchStats(); }, [users, suppliers, fetchStats]);

  return { users, suppliers, stats, loading, updateUser, deleteUser, updateSupplier, deleteSupplier };
};