import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../services/api";
import type { Company } from "../types/company";
import { useAuth } from "./AuthContext";

type CompanyCtx = {
  companies: Map<string, Company>;
  getCompanyName: (companyId: string) => string;
  refreshCompanies: () => Promise<void>;
  loading: boolean;
};

const Ctx = createContext<CompanyCtx | undefined>(undefined);

export const CompanyProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { session } = useAuth();
  const [companies, setCompanies] = useState<Map<string, Company>>(new Map());
  const [loading, setLoading] = useState(false);

  const loadCompanies = useCallback(async () => {
    if (!session) return;

    try {
      setLoading(true);
      console.log("🏢 Loading companies...");
      const res = await api.get("/companies");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const companyMap = new Map<string, Company>();
      data.forEach((company: Company) => {
        companyMap.set(company._id, company);
      });

      setCompanies(companyMap);
      console.log("✅ Companies loaded:", companyMap.size);
    } catch (error: any) {
      // Falls keine Berechtigung für /companies, versuche einzelne Company zu laden
      if (error?.response?.status === 403 && session.user.company) {
        try {
          console.log(
            "⚠️ Keine Berechtigung für alle Companies, lade eigene Company..."
          );
          const res = await api.get(`/companies/${session.user.company}`);
          const company = res.data;
          const companyMap = new Map<string, Company>();
          companyMap.set(company._id, company);
          setCompanies(companyMap);
          console.log("✅ Company loaded:", company.name);
        } catch (err) {
          console.warn("⚠️ Company konnte nicht geladen werden:", err);
        }
      } else {
        console.warn("⚠️ Companies konnten nicht geladen werden:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadCompanies();
    }
  }, [session, loadCompanies]);

  const getCompanyName = useCallback(
    (companyId: string): string => {
      const company = companies.get(companyId);
      return company?.name || company?.displayName || companyId;
    },
    [companies]
  );

  const refreshCompanies = useCallback(async () => {
    await loadCompanies();
  }, [loadCompanies]);

  return (
    <Ctx.Provider
      value={{ companies, getCompanyName, refreshCompanies, loading }}
    >
      {children}
    </Ctx.Provider>
  );
};

export function useCompanies() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompanies must be used within CompanyProvider");
  return ctx;
}
