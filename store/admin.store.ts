import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin } from "@/types/admin.types";
import { clearAuthToken } from "@/utils/api";

interface AdminState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAdmin: (admin: Admin) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  reset: () => void;

  // Role-based helpers
  isSuperAdmin: () => boolean;
  hasBusinessAccess: (businessId: string) => boolean;
  getFullName: () => string;
  getInitials: () => string;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: false,

      setAdmin: (admin) => set({ admin, isAuthenticated: true }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        clearAuthToken();
        set({ admin: null, isAuthenticated: false });
      },

      // Clears this store without touching the shared auth cookie, so the
      // other role's login can reset stale state after setting its token.
      reset: () => set({ admin: null, isAuthenticated: false }),

      // Check if current admin is super-admin
      isSuperAdmin: () => {
        const { admin } = get();
        return admin?.role === "super-admin";
      },

      // Check if admin has access to a specific business
      hasBusinessAccess: (businessId: string) => {
        const { admin } = get();
        if (!admin) return false;
        // Super-admins have access to all businesses
        if (admin.role === "super-admin") return true;
        // Regular admins only have access to assigned businesses
        return admin.businessIds?.includes(businessId) ?? false;
      },

      // Get full name of current admin
      getFullName: () => {
        const { admin } = get();
        if (!admin) return "";
        return `${admin.firstName} ${admin.lastName}`;
      },

      // Get initials for avatar
      getInitials: () => {
        const { admin } = get();
        if (!admin) return "";
        return `${admin.firstName[0] || ""}${admin.lastName[0] || ""}`.toUpperCase();
      },
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
