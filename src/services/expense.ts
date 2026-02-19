import api from "./api";
import { mockExpenseRequests } from "@/data/mock";
import { ExpenseRequest } from "@/types";

/** Expense service — mock implementations backed by local data */
export const expenseService = {
  getAll: async (): Promise<ExpenseRequest[]> => {
    // In production: return (await api.get("/expenses")).data;
    return Promise.resolve(mockExpenseRequests);
  },

  getById: async (id: string): Promise<ExpenseRequest | undefined> => {
    return Promise.resolve(mockExpenseRequests.find((r) => r.id === id));
  },

  create: async (data: Partial<ExpenseRequest>): Promise<ExpenseRequest> => {
    // In production: return (await api.post("/expenses", data)).data;
    const created = { ...data, id: `req${Date.now()}`, createdAt: new Date().toISOString() } as ExpenseRequest;
    return Promise.resolve(created);
  },

  approve: async (id: string, comment?: string): Promise<void> => {
    // In production: await api.post(`/expenses/${id}/approve`, { comment });
    return Promise.resolve();
  },

  reject: async (id: string, reason: string): Promise<void> => {
    // In production: await api.post(`/expenses/${id}/reject`, { reason });
    return Promise.resolve();
  },
};
