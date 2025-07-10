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
      // Ensure all required fields are present
      return {
        ...DEFAULT_RETIREMENT_DATA,
        ...parsed,
        accounts: parsed.accounts || [],
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
