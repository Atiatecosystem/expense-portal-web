import api from "./api";
import { mockUsers } from "@/data/mock";
import { User } from "@/types";

/** User service — mock implementations */
export const userService = {
  getAll: async (): Promise<User[]> => {
    return Promise.resolve(mockUsers);
  },

  getById: async (id: string): Promise<User | undefined> => {
    return Promise.resolve(mockUsers.find((u) => u.id === id));
  },

  create: async (data: Partial<User>): Promise<User> => {
    const created = { ...data, id: `u${Date.now()}`, createdAt: new Date().toISOString() } as User;
    return Promise.resolve(created);
  },

  toggleActive: async (id: string): Promise<void> => {
    return Promise.resolve();
  },
};
