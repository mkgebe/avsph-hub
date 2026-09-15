import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginStaff, getCurrentStaff } from "@/hooks/api/auth/staff.auth";
import { signOut } from "@/hooks/api/auth/auth";
import type { StaffLoginRequest } from "@/types/staff.types";
import { useStaffStore } from "@/store/staff.store";
import { useAdminStore } from "@/store/admin.store";
import { getErrorMessage } from "@/lib/errors";

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
      // Both roles share one Supabase session, so a leftover admin session
      // would otherwise keep claiming to be authenticated as an admin.
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
        description: getErrorMessage(error, "Invalid email or password."),
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useCurrentStaff = () => {
  return useQuery({
    queryKey: ["staff", "me"],
    queryFn: getCurrentStaff,
    // See useCurrentAdmin: the session is local, so there is nothing to gate on.
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStaffLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useStaffStore();

  return async () => {
    // One Supabase session backs both roles, so signing out ends both.
    await signOut();
    logout();
    useAdminStore.getState().reset();
    queryClient.clear();
    toast.success("Logged out", {
      description: "You have been signed out successfully.",
    });
    router.push("/login");
  };
};
