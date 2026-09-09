import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  loginAdmin,
  registerAdmin,
  getCurrentAdmin,
  setAuthToken,
} from "@/hooks/api/auth/auth";
import type { LoginRequest, RegisterRequest } from "@/types/auth.types";
import { useAdminStore } from "@/store/admin.store";
import { useStaffStore } from "@/store/staff.store";
import { getApiErrorMessage, hasAuthToken } from "@/utils/api";
import { supabase } from "@/utils/supabase/client";

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAdmin, setLoading } = useAdminStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginAdmin(data),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      // Save token in cookie
      setAuthToken(data.token);
      // Both roles share one auth cookie, so a leftover staff session would
      // otherwise keep claiming to be authenticated with an admin token.
      useStaffStore.getState().reset();
      // Update zustand store
      setAdmin(data.admin);
      // Drop any cached data belonging to the previous session
      queryClient.clear();
      // Show success toast
      toast.success("Welcome back!", {
        description: `Logged in as ${data.admin.firstName} ${data.admin.lastName}`,
      });
      // Redirect to dashboard
      router.push("/overview");
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

export const useRegister = () => {
  const router = useRouter();
  const { setLoading } = useAdminStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerAdmin(data),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      toast.success("Registration successful!", {
        description: "You can now sign in with your credentials.",
      });
      // Redirect to login after registration
      router.push("/login");
    },
    onError: (error) => {
      toast.error("Registration failed", {
        description: getApiErrorMessage(error, "Registration failed."),
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useCurrentAdmin = () => {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: getCurrentAdmin,
    // With no token at all there is nobody to look up, and firing the request
    // anyway just produces a 401 on every visit to a protected page.
    enabled: isAuthenticated || hasAuthToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAdminStore();

  return async () => {
    // End the Supabase session first; the stores and cookie are only a
    // local mirror of it.
    await supabase.auth.signOut();
    logout();
    // The cookie is shared, so signing out of one role signs out of both.
    useStaffStore.getState().reset();
    queryClient.clear();
    toast.success("Logged out", {
      description: "You have been signed out successfully.",
    });
    router.push("/login");
  };
};
