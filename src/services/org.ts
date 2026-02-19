import api from "./api";
import { mockOrganizations } from "@/data/mock";
import { Organization } from "@/types";

/** Organization service — mock implementations */
export const orgService = {
  getAll: async (): Promise<Organization[]> => {
    return Promise.resolve(mockOrganizations);
  },

  getById: async (id: string): Promise<Organization | undefined> => {
    return Promise.resolve(mockOrganizations.find((o) => o.id === id));
  },

  create: async (data: Partial<Organization>): Promise<Organization> => {
    const created = { ...data, id: `org${Date.now()}`, createdAt: new Date().toISOString() } as Organization;
    return Promise.resolve(created);
  },
};
