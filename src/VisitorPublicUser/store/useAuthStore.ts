import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginData } from "../api/api";
import { getCurrentUser, loginUser } from "../api/api";

interface AuthState {
  token: string | null;
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

// Map backend accountType to frontend role
const mapAccountTypeToRole = (accountType: string): string => {
  const roleMap: Record<string, string> = {
    individual: "buyer",
    business: "buyer",
    supplier: "supplier",
    logistics: "logistics",
    admin: "admin",
    super_admin: "super-admin",
  };
  return roleMap[accountType] || "buyer";
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser(data);
          if (response.success && response.token) {
            localStorage.setItem("token", response.token);
            set({ token: response.token });
            await get().fetchCurrentUser();
          } else throw new Error("Login failed");
        } catch (error: any) {
          set({ error: error?.msg || error?.message || "Login failed", isLoading: false });
          throw error;
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await getCurrentUser();
          if (response.success && response.data) {
            const user = response.data;
            const role = mapAccountTypeToRole(user.accountType);
            localStorage.setItem("role", role);
            set({ user, role, isAuthenticated: true, isLoading: false });
          }
        } catch (error: any) {
          set({ error: error?.msg || error?.message || "Failed to fetch user", isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        set({ token: null, user: null, role: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    { name: "auth-storage", partialize: (state) => ({ token: state.token, user: state.user, role: state.role, isAuthenticated: state.isAuthenticated }) }
  )
);
