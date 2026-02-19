import api from "./api";
import { LoginCredentials } from "@/types";
import { mockUsers, MOCK_CREDENTIALS } from "@/data/mock";

/** Auth service — mock implementation */
export const authService = {
  login: async (creds: LoginCredentials) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    if (creds.email === MOCK_CREDENTIALS.email && creds.password === MOCK_CREDENTIALS.password) {
      return { user: mockUsers[0], token: "mock-jwt-token" };
    }
    throw new Error("Invalid email or password.");
  },

  logout: async () => {
    localStorage.removeItem("atiat_user");
  },

  forgotPassword: async (email: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    return { success: true };
  },

  resetPassword: async (password: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    return { success: true };
  },
};
