export type AccountType = "IRA" | "Roth IRA" | "Brokerage";

export interface ContributionPlan {
  id: string;
  yearlyAmount: number;
  startAge: number;
  endAge: number;
}

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  startingAmount: number;
  contributionPlans: ContributionPlan[];
  color: string;
}

export interface RetirementData {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  accounts: Account[];
  expectedReturn: number;
  inflationRate: number;
  taxRate: number;
  capitalGainsRate: number;
}

export interface YearlyProjection {
  year: number;
  age: number;
  totalBalance: number;
  accountBalances: Record<string, number>;
  accountWithdrawals: Record<string, number>;
  contributions: number;
  withdrawals: number;
  taxes: number;
  netIncome: number;
}

export interface ChartData {
  year: number;
  IRA: number;
  "Roth IRA": number;
  Brokerage: number;
  Total: number;
}

export interface TaxCalculation {
  iraTax: number;
  brokerageTax: number;
  totalTax: number;
}

export const ACCOUNT_COLORS = {
  IRA: "#3B82F6", // Blue
  "Roth IRA": "#10B981", // Green
  Brokerage: "#F59E0B", // Amber
};

export const DEFAULT_RETIREMENT_DATA: RetirementData = {
  currentAge: 30,
  retirementAge: 65,
  lifeExpectancy: 90,
  accounts: [],
  expectedReturn: 7,
  inflationRate: 2.5,
  taxRate: 22,
  capitalGainsRate: 15,
};
