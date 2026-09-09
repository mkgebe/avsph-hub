import api, { setAuthToken } from '@/utils/api';
import type { Admin } from '@/types/admin.types';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth.types';

// Re-export for backward compatibility
export { setAuthToken };

// API functions
export const loginAdmin = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/admin/login', data);
    return response.data;
};

export const registerAdmin = async (data: RegisterRequest): Promise<Admin> => {
    const response = await api.post<Admin>('/admin/register', data);
    return response.data;
};

// A 401 here means "this token is not an admin token", not "the session is
// dead" - pages such as /docs probe both roles. Callers decide what to do,
// so this request opts out of the global redirect-to-login.
export const getCurrentAdmin = async (): Promise<Admin> => {
    const response = await api.get<Admin>('/admin/me', { skipAuthRedirect: true });
    return response.data;
};
