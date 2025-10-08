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
      console.log(
        "👤 Session user company:",
        session.user.company || session.user.companyId
      );

      // Versuche verschiedene Endpoints
      let res;
      let endpoint = "";

      try {
        endpoint = "/companies/search";
        console.log("🔄 Trying:", endpoint);
        res = await api.get(endpoint);
      } catch (searchErr: any) {
        console.log("❌ /companies/search failed:", searchErr.response?.status);
        try {
          endpoint = "/companies";
          console.log("🔄 Trying:", endpoint);
          res = await api.get(endpoint);
        } catch (companiesErr: any) {
          console.log("❌ /companies failed:", companiesErr.response?.status);
          throw companiesErr;
        }
      }

      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      console.log(
        "📊 Raw response from",
        endpoint,
        ":",
        data.length,
        "companies"
      );

      const companyMap = new Map<string, Company>();
      data.forEach((company: Company) => {
        if (company._id && company.name) {
          companyMap.set(company._id, company);
          console.log("📝 Mapped:", company._id, "→", company.name);
        } else {
          console.warn("⚠️ Invalid company data:", company);
        }
      });

      setCompanies(companyMap);
      console.log("✅ Companies loaded:", companyMap.size);

      // Debug: Zeige alle geladenen Companies
      companyMap.forEach((company, id) => {
        console.log("📋 Company:", id, "→", company.name);
      });
    } catch (error: any) {
      console.log("❌ All company endpoints failed:", error.response?.status);

      // Fallback: Versuche eigene Company zu laden
      const userCompanyId = session.user.company || session.user.companyId;
      if (userCompanyId) {
        try {
          console.log("🔄 Fallback: Loading own company:", userCompanyId);
          const res = await api.get(`/companies/${userCompanyId}`);
          const company = res.data;

          if (company._id && company.name) {
            const companyMap = new Map<string, Company>();
            companyMap.set(company._id, company);
            setCompanies(companyMap);
            console.log(
              "✅ Own company loaded:",
              company._id,
              "→",
              company.name
            );
          } else {
            console.warn("⚠️ Invalid own company data:", company);
          }
        } catch (err: any) {
          console.warn("⚠️ Could not load own company:", err.response?.status);
        }
      } else {
        console.warn("⚠️ No company ID in user session");
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
      if (!companyId) return "Unbekannt";
      const company = companies.get(companyId);
      const name = company?.name || company?.displayName;
      console.log(
        "🔍 getCompanyName:",
        companyId,
        "→",
        name || "NICHT GEFUNDEN"
      );
      return name || companyId;
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
