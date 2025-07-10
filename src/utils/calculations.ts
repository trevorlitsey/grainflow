import type { RetirementData, YearlyProjection, ChartData } from "../types";

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

    // Calculate total withdrawal amount first
    let totalWithdrawalNeeded = 0;
    if (isRetired) {
      // Calculate total balance before withdrawals (including growth)
      const totalBalanceBeforeWithdrawals = Object.values(
        accountBalances
      ).reduce(
        (sum, balance) =>
          sum + calculateCompoundInterest(balance, data.expectedReturn, 1),
        0
      );
      // Check for global withdrawal plan for this year
      let planWithdrawal = null;
      if (data.withdrawalPlans && data.withdrawalPlans.length > 0) {
        const activePlan = data.withdrawalPlans.find(
          (p) => age >= p.startAge && age <= p.endAge
        );
        if (activePlan) {
          planWithdrawal =
            (activePlan.percentage / 100) * totalBalanceBeforeWithdrawals;
        }
      }
      totalWithdrawalNeeded =
        planWithdrawal !== null
          ? planWithdrawal
          : totalBalanceBeforeWithdrawals * 0.04;
    }

    // Calculate withdrawals first to ensure they add up to 4% or custom plan
    const withdrawalAmounts: Record<string, number> = {};
    let totalWithdrawalsCalculated = 0;

    if (isRetired) {
      // Calculate total balance before withdrawals (including growth)
      const balancesBeforeGrowth: Record<string, number> = {};
      data.accounts.forEach((account) => {
        balancesBeforeGrowth[account.id] = calculateCompoundInterest(
          accountBalances[account.id],
          data.expectedReturn,
          1
        );
      });

      // Always use the totalWithdrawalNeeded (from plan or 4% rule)
      let remainingWithdrawal = totalWithdrawalNeeded;

      // First, withdraw from brokerage accounts
      const brokerageAccounts = data.accounts.filter(
        (acc) => acc.type === "Brokerage"
      );
      for (const account of brokerageAccounts) {
        if (remainingWithdrawal <= 0) break;

        const availableBalance = balancesBeforeGrowth[account.id];
        const withdrawalAmount = Math.min(
          availableBalance,
          remainingWithdrawal
        );
        withdrawalAmounts[account.id] = withdrawalAmount;
        totalWithdrawalsCalculated += withdrawalAmount;
        remainingWithdrawal -= withdrawalAmount;
      }

      // Then, withdraw from IRA accounts
      if (
        (age >= 59.5 || data.allowEarlyIRAWithdrawals) &&
        remainingWithdrawal > 0
      ) {
        const iraAccounts = data.accounts.filter((acc) => acc.type === "IRA");
        for (const account of iraAccounts) {
          if (remainingWithdrawal <= 0) break;

          const availableBalance = balancesBeforeGrowth[account.id];
          const withdrawalAmount = Math.min(
            availableBalance,
            remainingWithdrawal
          );
          withdrawalAmounts[account.id] = withdrawalAmount;
          totalWithdrawalsCalculated += withdrawalAmount;
          remainingWithdrawal -= withdrawalAmount;
        }
      }

      // Finally, withdraw from Roth IRA accounts
      if (
        (age >= 59.5 || data.allowEarlyIRAWithdrawals) &&
        remainingWithdrawal > 0
      ) {
        const rothAccounts = data.accounts.filter(
          (acc) => acc.type === "Roth IRA"
        );
        for (const account of rothAccounts) {
          if (remainingWithdrawal <= 0) break;

          const availableBalance = balancesBeforeGrowth[account.id];
          const withdrawalAmount = Math.min(
            availableBalance,
            remainingWithdrawal
          );
          withdrawalAmounts[account.id] = withdrawalAmount;
          totalWithdrawalsCalculated += withdrawalAmount;
          remainingWithdrawal -= withdrawalAmount;
        }
      }
    }

    // Now apply the withdrawals and calculate new balances
    data.accounts.forEach((account) => {
      const currentBalance = accountBalances[account.id];
      let newBalance: number;

      if (isRetired) {
        const withdrawalAmount = withdrawalAmounts[account.id] || 0;
        newBalance =
          calculateCompoundInterest(currentBalance, data.expectedReturn, 1) -
          withdrawalAmount;
      } else {
        // During working years, contribute to accounts based on contribution plans
        const currentYearlyContribution = account.contributionPlans
          .filter((plan) => age >= plan.startAge && age <= plan.endAge)
          .reduce((sum, plan) => sum + plan.yearlyAmount, 0);

        newBalance = calculateCompoundInterest(
          currentBalance,
          data.expectedReturn,
          1,
          currentYearlyContribution
        );
        totalContributions += currentYearlyContribution;
      }

      newAccountBalances[account.id] = Math.max(0, newBalance);
      totalBalance += newAccountBalances[account.id];
    });

    totalWithdrawals = totalWithdrawalsCalculated;

    // Calculate taxes
    const taxes = calculateTaxes(data, withdrawalAmounts, isRetired, age);
    const netIncome = totalWithdrawals - taxes;

    projections.push({
      year: currentYear + year,
      age,
      totalBalance,
      accountBalances: { ...newAccountBalances },
      accountWithdrawals: { ...withdrawalAmounts },
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

const calculateTaxes = (
  data: RetirementData,
  accountWithdrawals: Record<string, number>,
  isRetired: boolean,
  age: number
): number => {
  if (!isRetired) return 0;

  let totalTax = 0;

  // Sum withdrawals by account type
  const iraWithdrawals = data.accounts
    .filter((acc) => acc.type === "IRA")
    .reduce((sum, acc) => sum + (accountWithdrawals[acc.id] || 0), 0);
  const rothWithdrawals = data.accounts
    .filter((acc) => acc.type === "Roth IRA")
    .reduce((sum, acc) => sum + (accountWithdrawals[acc.id] || 0), 0);
  const brokerageWithdrawals = data.accounts
    .filter((acc) => acc.type === "Brokerage")
    .reduce((sum, acc) => sum + (accountWithdrawals[acc.id] || 0), 0);

  // Apply taxes
  if (brokerageWithdrawals > 0) {
    totalTax += brokerageWithdrawals * (data.capitalGainsRate / 100);
  }
  if (iraWithdrawals > 0) {
    if (age < 59.5 && data.allowEarlyIRAWithdrawals) {
      // Early IRA withdrawal: 10% penalty + regular tax
      totalTax += iraWithdrawals * (0.1 + data.taxRate / 100);
    } else if (age >= 59.5) {
      totalTax += iraWithdrawals * (data.taxRate / 100);
    }
  }
  if (rothWithdrawals > 0) {
    if (age < 59.5 && data.allowEarlyIRAWithdrawals) {
      // Early Roth IRA withdrawal: 10% penalty only
      totalTax += rothWithdrawals * 0.1;
    }
    // No tax for Roth IRA after 59.5
  }

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
