// src/hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import api, { type User } from "../api/api";
import { message } from "antd";

interface UseProfileReturn {
  user: User | null;
  loading: boolean;
  updateProfile: (data: Partial<Pick<User, "fullName" | "phone" | "country">>) => Promise<void>;
  updateProfileImage: (file: File) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user profile
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: User }>("/api/auth/me");
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        message.error("Failed to fetch profile");
        setUser(null);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || error.message || "Failed to fetch profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Update basic profile information
  const updateProfile = async (data: Partial<Pick<User, "fullName" | "phone" | "country">>) => {
    try {
      const response = await api.put<{ success: boolean; data: User }>("/api/auth/me", data);
      if (response.data.success) {
        message.success("Profile updated successfully");
        await fetchUser();
      } else {
        message.error("Failed to update profile");
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || error.message || "Failed to update profile");
    }
  };

  // Upload or update profile image
  const updateProfileImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await api.put<{ success: boolean; data: User }>("/api/auth/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        message.success("Profile image updated successfully");
        await fetchUser();
      } else {
        message.error("Failed to update profile image");
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || error.message || "Failed to update profile image");
    }
  };

  // Change user password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put<{ success: boolean }>("/api/auth/profile/password", { currentPassword, newPassword });
      if (response.data.success) {
        message.success("Password changed successfully");
      } else {
        message.error("Failed to change password");
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || error.message || "Failed to change password");
    }
  };

  return {
    user,
    loading,
    updateProfile,
    updateProfileImage,
    changePassword,
    refreshUser: fetchUser,
  };
};
