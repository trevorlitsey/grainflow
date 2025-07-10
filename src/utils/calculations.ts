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
      const withdrawalRate = 0.04; // 4% rule
      // Calculate total balance before withdrawals (including growth)
      const totalBalanceBeforeWithdrawals = Object.values(
        accountBalances
      ).reduce(
        (sum, balance) =>
          sum + calculateCompoundInterest(balance, data.expectedReturn, 1),
        0
      );
      totalWithdrawalNeeded = totalBalanceBeforeWithdrawals * withdrawalRate;
    }

    // Calculate withdrawals first to ensure they add up to 4%
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

      // Distribute withdrawals according to priority order
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

      // Then, withdraw from IRA accounts (after 59.5)
      if (age >= 59.5 && remainingWithdrawal > 0) {
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

      // Finally, withdraw from Roth IRA accounts (after 59.5)
      if (age >= 59.5 && remainingWithdrawal > 0) {
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

    totalWithdrawals = totalWithdrawalsCalculated;

    // Calculate taxes
    const taxes = calculateTaxes(
      data,
      newAccountBalances,
      totalWithdrawals,
      isRetired,
      age,
      accountBalances
    );
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
  accountBalances: Record<string, number>,
  totalWithdrawals: number,
  isRetired: boolean,
  age: number,
  previousBalances: Record<string, number>
): number => {
  if (!isRetired) return 0;

  let totalTax = 0;
  let remainingWithdrawal = totalWithdrawals;

  // Calculate taxes based on the withdrawal priority order
  const brokerageAccounts = data.accounts.filter(
    (acc) => acc.type === "Brokerage"
  );
  const iraAccounts = data.accounts.filter((acc) => acc.type === "IRA");
  const rothAccounts = data.accounts.filter((acc) => acc.type === "Roth IRA");

  // First, calculate taxes from brokerage withdrawals
  for (const brokerageAccount of brokerageAccounts) {
    if (remainingWithdrawal <= 0) break;

    const previousBalance = previousBalances[brokerageAccount.id] || 0;
    const currentBalance = accountBalances[brokerageAccount.id] || 0;
    const withdrawalAmount = Math.min(
      previousBalance - currentBalance,
      remainingWithdrawal
    );

    if (withdrawalAmount > 0) {
      // Brokerage accounts are subject to capital gains tax
      totalTax += withdrawalAmount * (data.capitalGainsRate / 100);
      remainingWithdrawal -= withdrawalAmount;
    }
  }

  // Then, calculate taxes from IRA withdrawals (after 59.5)
  if (age >= 59.5 && remainingWithdrawal > 0) {
    for (const iraAccount of iraAccounts) {
      if (remainingWithdrawal <= 0) break;

      const previousBalance = previousBalances[iraAccount.id] || 0;
      const currentBalance = accountBalances[iraAccount.id] || 0;
      const withdrawalAmount = Math.min(
        previousBalance - currentBalance,
        remainingWithdrawal
      );

      if (withdrawalAmount > 0) {
        // Traditional IRA withdrawals are taxed as ordinary income
        totalTax += withdrawalAmount * (data.taxRate / 100);
        remainingWithdrawal -= withdrawalAmount;
      }
    }
  }

  // Finally, calculate taxes from Roth IRA withdrawals (after 59.5)
  if (age >= 59.5 && remainingWithdrawal > 0) {
    for (const rothAccount of rothAccounts) {
      if (remainingWithdrawal <= 0) break;

      const previousBalance = previousBalances[rothAccount.id] || 0;
      const currentBalance = accountBalances[rothAccount.id] || 0;
      const withdrawalAmount = Math.min(
        previousBalance - currentBalance,
        remainingWithdrawal
      );

      if (withdrawalAmount > 0) {
        // Roth IRA withdrawals are tax-free
        totalTax += 0;
        remainingWithdrawal -= withdrawalAmount;
      }
    }
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
