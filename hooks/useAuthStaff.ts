import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  loginStaff,
  getCurrentStaff,
  setStaffAuthToken,
} from "@/hooks/api/auth/staff.auth";
import type { StaffLoginRequest } from "@/types/staff.types";
import { useStaffStore } from "@/store/staff.store";
import { useAdminStore } from "@/store/admin.store";
import { getApiErrorMessage, hasAuthToken } from "@/utils/api";
import { supabase } from "@/utils/supabase/client";

export const useStaffLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setStaff, setLoading } = useStaffStore();

  return useMutation({
    mutationFn: (data: StaffLoginRequest) => loginStaff(data),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      // Save token in cookie
      setStaffAuthToken(data.token);
      // Both roles share one auth cookie, so a leftover admin session would
      // otherwise keep claiming to be authenticated with a staff token.
      useAdminStore.getState().reset();
      // Update zustand store
      setStaff(data.staff);
      // Drop any cached data belonging to the previous session
      queryClient.clear();
      // Show success toast
      toast.success("Welcome back!", {
        description: `Logged in as ${data.staff.firstName} ${data.staff.lastName}`,
      });
      // Redirect to staff dashboard
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Login failed", {
        description: getApiErrorMessage(error, "Invalid email or password."),
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useCurrentStaff = () => {
  const isAuthenticated = useStaffStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["staff", "me"],
    queryFn: getCurrentStaff,
    // See useCurrentAdmin: skip the lookup when there is no token to check.
    enabled: isAuthenticated || hasAuthToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStaffLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useStaffStore();

  return async () => {
    // End the Supabase session first; the stores and cookie are only a
    // local mirror of it.
    await supabase.auth.signOut();
    logout();
    // The cookie is shared, so signing out of one role signs out of both.
    useAdminStore.getState().reset();
    queryClient.clear();
    toast.success("Logged out", {
      description: "You have been signed out successfully.",
    });
    router.push("/login");
  };
};
