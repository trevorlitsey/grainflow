import type { RetirementData, YearlyProjection, ChartData } from "../types";
import type { Account } from "../types";

export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  years: number,
  contributions: number = 0
): number => {
  const r = rate / 100;
  if (contributions === 0) {
    return principal * Math.pow(1 + r, years);
  }

  // Future value of principal + future value of contributions
  const futureValuePrincipal = principal * Math.pow(1 + r, years);
  const futureValueContributions =
    contributions * ((Math.pow(1 + r, years) - 1) / r);

  return futureValuePrincipal + futureValueContributions;
};

export const calculateYearlyProjections = (
  data: RetirementData
): YearlyProjection[] => {
  const projections: YearlyProjection[] = [];
  const currentYear = new Date().getFullYear();
  const totalYears = data.lifeExpectancy - data.currentAge;

  // Initialize account balances
  const accountBalances: Record<string, number> = {};
  data.accounts.forEach((account) => {
    accountBalances[account.id] = account.startingAmount;
  });

  for (let year = 0; year <= totalYears; year++) {
    const age = data.currentAge + year;
    const isRetired = age >= data.retirementAge;

    // Calculate new balances for each account
    const newAccountBalances: Record<string, number> = {};
    let totalBalance = 0;
    let totalContributions = 0;
    let totalWithdrawals = 0;

    data.accounts.forEach((account) => {
      const currentBalance = accountBalances[account.id];
      let newBalance: number;

      if (isRetired) {
        // During retirement, withdraw from accounts
        const withdrawalAmount = calculateWithdrawalAmount(
          data,
          account,
          currentBalance,
          age
        );
        newBalance =
          calculateCompoundInterest(currentBalance, data.expectedReturn, 1) -
          withdrawalAmount;
        totalWithdrawals += withdrawalAmount;
      } else {
        // During working years, contribute to accounts
        newBalance = calculateCompoundInterest(
          currentBalance,
          data.expectedReturn,
          1,
          account.yearlyContribution
        );
        totalContributions += account.yearlyContribution;
      }

      newAccountBalances[account.id] = Math.max(0, newBalance);
      totalBalance += newAccountBalances[account.id];
    });

    // Calculate taxes
    const taxes = calculateTaxes(
      data,
      newAccountBalances,
      totalWithdrawals,
      isRetired,
      age
    );
    const netIncome = totalWithdrawals - taxes;

    projections.push({
      year: currentYear + year,
      age,
      totalBalance,
      accountBalances: { ...newAccountBalances },
      contributions: totalContributions,
      withdrawals: totalWithdrawals,
      taxes,
      netIncome,
    });

    // Update balances for next iteration
    Object.assign(accountBalances, newAccountBalances);
  }

  return projections;
};

const calculateWithdrawalAmount = (
  data: RetirementData,
  account: Account,
  balance: number,
  age: number
): number => {
  // Simple 4% rule for retirement withdrawals
  const totalBalance = data.accounts.reduce((sum, acc) => {
    return sum + (acc.id === account.id ? balance : 0);
  }, 0);

  const withdrawalRate = 0.04; // 4% rule
  const baseWithdrawal = totalBalance * withdrawalRate;

  // Check if account can be withdrawn from based on age
  if (age < 59.5) {
    if (account.type === "IRA" || account.type === "Roth IRA") {
      // Early withdrawal penalty: 10% + regular taxes
      return 0; // Don't withdraw from IRA/Roth IRA before 59.5
    }
  }

  return baseWithdrawal;
};

const calculateTaxes = (
  data: RetirementData,
  accountBalances: Record<string, number>,
  totalWithdrawals: number,
  isRetired: boolean,
  age: number
): number => {
  if (!isRetired) return 0;

  let totalTax = 0;

  data.accounts.forEach((account) => {
    const balance = accountBalances[account.id];
    const withdrawalAmount =
      totalWithdrawals *
      (balance / Object.values(accountBalances).reduce((a, b) => a + b, 0));

    // Check age restrictions for IRA/Roth IRA accounts
    if (age < 59.5 && (account.type === "IRA" || account.type === "Roth IRA")) {
      return; // Skip tax calculation for restricted accounts
    }

    switch (account.type) {
      case "IRA":
        // Traditional IRA withdrawals are taxed as ordinary income
        totalTax += withdrawalAmount * (data.taxRate / 100);
        break;
      case "Roth IRA":
        // Roth IRA withdrawals are tax-free
        totalTax += 0;
        break;
      case "Brokerage":
        // Brokerage accounts are subject to capital gains tax
        totalTax += withdrawalAmount * (data.capitalGainsRate / 100);
        break;
    }
  });

  return totalTax;
};

export const calculateChartData = (
  projections: YearlyProjection[]
): ChartData[] => {
  return projections.map((projection) => {
    const chartData: ChartData = {
      year: projection.year,
      IRA: 0,
      "Roth IRA": 0,
      Brokerage: 0,
      Total: projection.totalBalance,
    };

    // Group account balances by type
    Object.entries(projection.accountBalances).forEach(
      ([accountId, balance]) => {
        // This is a simplified approach - in a real app you'd need to track account types
        // For now, we'll distribute evenly across account types
        const accountTypes = ["IRA", "Roth IRA", "Brokerage"];
        const typeIndex = parseInt(accountId) % accountTypes.length;
        const accountType = accountTypes[typeIndex] as keyof ChartData;
        chartData[accountType] += balance;
      }
    );

    return chartData;
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
