import { supabase } from "@/lib/supabase";

export interface AdminForgotPasswordRequest {
  email: string;
}

export interface AdminForgotPasswordResponse {
  message: string;
}

export interface AdminResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface AdminResetPasswordResponse {
  message: string;
}

// Supabase emails a recovery link rather than a code. The reply is the same
// whether or not the address exists, so this cannot be used to discover who
// has an account.
export const adminForgotPassword = async (
  data: AdminForgotPasswordRequest,
): Promise<AdminForgotPasswordResponse> => {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo:
      typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : undefined,
  });

  if (error) throw new Error(error.message);
  return {
    message:
      "If that address has an account, a password reset link is on its way.",
  };
};

// Opening the emailed link signs the browser in with a recovery session, and
// the new password is set on that session. There is no code to type in, so
// the code field is accepted and ignored for compatibility.
export const adminResetPassword = async (
  data: AdminResetPasswordRequest,
): Promise<AdminResetPasswordResponse> => {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error(
      "Open the reset link from your email first, then set a new password.",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  });
  if (error) throw new Error(error.message);

  return { message: "Password updated. You can now sign in." };
};
