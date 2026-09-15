import axios from "axios";

// Raised when the session itself is the problem: no session, a rejected one,
// or a session whose owner has no profile for the role being used. These end a
// session. Everything else (an unreachable network, a server fault) must not,
// so that a blip does not sign a working user out.
export class AuthRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthRejectedError";
  }
}

// Supabase reports bad credentials with these; they mean "try again with
// different details", not "something is broken".
const REJECTED_AUTH_STATUSES = [400, 401, 403, 422];

export const isSessionRejection = (error: unknown): boolean => {
  if (error instanceof AuthRejectedError) return true;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    return status === 401 || status === 403;
  }
  const status = (error as { status?: number } | null)?.status;
  return typeof status === "number" && REJECTED_AUTH_STATUSES.includes(status);
};

// Turns any failure into something a person can act on. Network faults are
// named as such rather than reported as bad credentials.
export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (!error) return fallback;

  if (error instanceof AuthRejectedError) return error.message;

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? "The server took too long to respond. Please try again."
        : "Cannot reach the server. Check your connection.";
    }
    const body = error.response.data as { error?: string; message?: string } | undefined;
    return body?.error || body?.message || fallback;
  }

  if (error instanceof Error) {
    // What fetch throws when the request never reached the server at all.
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      return "Cannot reach the server. Check your connection or the API configuration.";
    }
    return error.message;
  }

  return fallback;
};
