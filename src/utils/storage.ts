import type { RetirementData } from "../types";
import { DEFAULT_RETIREMENT_DATA } from "../types";

const STORAGE_KEY = "retirement-app-data";

export const saveRetirementData = (data: RetirementData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save retirement data:", error);
  }
};

export const loadRetirementData = (): RetirementData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Migrate accounts from old structure to new structure
      const migratedAccounts = (parsed.accounts || []).map(
        (account: Record<string, unknown>) => {
          // If account has the old yearlyContribution field, migrate it
          if (
            "yearlyContribution" in account &&
            !("contributionPlans" in account)
          ) {
            const yearlyContribution = account.yearlyContribution as number;
            return {
              ...account,
              contributionPlans:
                yearlyContribution > 0
                  ? [
                      {
                        id: Date.now().toString(),
                        yearlyAmount: yearlyContribution,
                        startAge: parsed.currentAge || 30,
                        endAge: parsed.retirementAge || 65,
                      },
                    ]
                  : [],
            };
          }
          return account;
        }
      );

      // Ensure all required fields are present
      return {
        ...DEFAULT_RETIREMENT_DATA,
        ...parsed,
        accounts: migratedAccounts,
      };
    }
  } catch (error) {
    console.error("Failed to load retirement data:", error);
  }

  return DEFAULT_RETIREMENT_DATA;
};

export const clearRetirementData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear retirement data:", error);
  }
};
