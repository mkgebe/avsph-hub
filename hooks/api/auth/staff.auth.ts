import api, { setAuthToken } from "@/utils/api";
import type {
  StaffLoginRequest,
  StaffLoginResponse,
  Staff,
} from "@/types/staff.types";

// Re-export for backward compatibility (alias)
export const setStaffAuthToken = setAuthToken;

// API functions
export const loginStaff = async (
  data: StaffLoginRequest,
): Promise<StaffLoginResponse> => {
  const response = await api.post<StaffLoginResponse>("/staff/login", data);
  return response.data;
};

// See getCurrentAdmin: a 401 means "not a staff token", so this request opts
// out of the global redirect-to-login.
export const getCurrentStaff = async (): Promise<Staff> => {
  const response = await api.get<Staff>("/staff/me", { skipAuthRedirect: true });
  return response.data;
};
