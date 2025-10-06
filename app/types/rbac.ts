import { User } from "./auth";
import { ShareRule } from "./location";

export function canViewLocation(
  viewer: User,
  subject: User,
  subjectShareRule?: ShareRule
): boolean {
  if (viewer.id === subject.id) return true; // selbst
  if (viewer.roles.includes("admin")) return true; // Admin
  if (viewer.companyId === subject.companyId) return true; // gleiche Company
  if (subjectShareRule?.enabled) {
    const roleMatch =
      subjectShareRule.allowedRoles?.some((r) => viewer.roles.includes(r)) ??
      false;
    const companyMatch =
      subjectShareRule.allowedCustomerCompanyIds?.includes(viewer.companyId) ??
      false;
    if (roleMatch || companyMatch) return true;
  }
  return false;
}
