import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  loginAdmin,
  registerAdmin,
  getCurrentAdmin,
  signOut,
} from "@/hooks/api/auth/auth";
import type { LoginRequest, RegisterRequest } from "@/types/auth.types";
import { useAdminStore } from "@/store/admin.store";
import { useStaffStore } from "@/store/staff.store";
import { getErrorMessage } from "@/lib/errors";

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
      // Both roles share one Supabase session, so a leftover staff session
      // would otherwise keep claiming to be authenticated as staff.
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
        description: getErrorMessage(error, "Invalid email or password."),
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
        description: getErrorMessage(error, "Registration failed."),
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useCurrentAdmin = () => {
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: getCurrentAdmin,
    // Supabase keeps the session in the browser, so this starts as a local
    // check and only reaches the network to load the profile row. There is
    // nothing to gate on.
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAdminStore();

  return async () => {
    // One Supabase session backs both roles, so signing out ends both.
    await signOut();
    logout();
    useStaffStore.getState().reset();
    queryClient.clear();
    toast.success("Logged out", {
      description: "You have been signed out successfully.",
    });
    router.push("/login");
  };
};
