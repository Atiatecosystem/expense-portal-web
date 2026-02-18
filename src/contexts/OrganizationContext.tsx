import React, { createContext, useContext, useState, type ReactNode } from "react";
import { Organization } from "@/types";
import { mockOrganizations } from "@/data/mock";

interface OrgContextValue {
  organizations: Organization[];
  currentOrg: Organization;
  switchOrg: (orgId: string) => void;
}

const OrganizationContext = createContext<OrgContextValue | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [currentOrg, setCurrentOrg] = useState<Organization>(mockOrganizations[0]);

  const switchOrg = (orgId: string) => {
    const org = mockOrganizations.find((o) => o.id === orgId);
    if (org) setCurrentOrg(org);
  };

  return (
    <OrganizationContext.Provider value={{ organizations: mockOrganizations, currentOrg, switchOrg }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
};
