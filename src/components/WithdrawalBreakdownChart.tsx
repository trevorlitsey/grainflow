import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { YearlyProjection } from "../types";
import type { Account } from "../types";
import { formatCurrency } from "../utils/calculations";

interface WithdrawalBreakdownChartProps {
  projections: YearlyProjection[];
  accounts: Account[];
}

const WithdrawalBreakdownChart = ({
  projections,
  accounts,
}: WithdrawalBreakdownChartProps) => {
  if (projections.length === 0 || accounts.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <p>No withdrawal data to display yet.</p>
          <p className="text-sm">
            Add accounts and set retirement age to see withdrawal breakdown!
          </p>
        </div>
      </div>
    );
  }

  // Filter to only retirement years (where withdrawals > 0)
  const retirementProjections = projections.filter((p) => p.withdrawals > 0);

  if (retirementProjections.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <p>No retirement withdrawals yet.</p>
          <p className="text-sm">
            Set your retirement age to see withdrawal breakdown!
          </p>
        </div>
      </div>
    );
  }

  const getTaxRate = (accountType: string): number => {
    switch (accountType) {
      case "IRA":
        return 0.22; // 22% tax rate
      case "Roth IRA":
        return 0; // No taxes
      case "Brokerage":
        return 0.15; // 15% capital gains
      default:
        return 0;
    }
  };

  // Calculate withdrawal breakdown by account
  const withdrawalData = retirementProjections.map((projection) => {
    const dataPoint: Record<string, any> = {
      year: projection.year,
      age: projection.age,
      totalWithdrawal: Math.round(projection.withdrawals),
      totalTaxes: Math.round(projection.taxes),
      netIncome: Math.round(projection.netIncome),
    };

    // Calculate withdrawal from each account based on its proportion of total balance
    const totalBalance = Object.values(projection.accountBalances).reduce(
      (sum, balance) => sum + balance,
      0
    );

    accounts.forEach((account) => {
      const accountBalance = projection.accountBalances[account.id] || 0;
      const withdrawalProportion =
        totalBalance > 0 ? accountBalance / totalBalance : 0;
      let accountWithdrawal = projection.withdrawals * withdrawalProportion;

      // Check age restrictions for IRA/Roth IRA accounts
      if (
        projection.age < 59.5 &&
        (account.type === "IRA" || account.type === "Roth IRA")
      ) {
        accountWithdrawal = 0; // No withdrawals from IRA/Roth IRA before 59.5
      }

      dataPoint[`${account.name}_withdrawal`] = Math.round(accountWithdrawal);
      dataPoint[`${account.name}_tax`] = Math.round(
        accountWithdrawal * getTaxRate(account.type)
      );
    });

    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">Year: {label}</p>
          <p className="text-sm text-gray-600">Age: {data.age}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm font-medium">
              Total Withdrawal: {formatCurrency(data.totalWithdrawal)}
            </p>
            <p className="text-sm font-medium text-red-600">
              Total Taxes: {formatCurrency(data.totalTaxes)}
            </p>
            <p className="text-sm font-medium text-green-600">
              Net Income: {formatCurrency(data.netIncome)}
            </p>
            <div className="border-t pt-2 mt-2">
              <p className="text-xs font-medium text-gray-600 mb-1">
                By Account:
              </p>
              {accounts.map((account) => {
                const withdrawal = data[`${account.name}_withdrawal`] || 0;
                const tax = data[`${account.name}_tax`] || 0;
                return (
                  <div key={account.id} className="text-xs">
                    <span style={{ color: account.color }}>●</span>{" "}
                    <span style={{ color: account.color }}>
                      {account.name}:
                    </span>{" "}
                    {formatCurrency(withdrawal)}
                    {tax > 0 && (
                      <span className="text-red-500 ml-1">
                        (tax: {formatCurrency(tax)})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Withdrawal Breakdown by Account
      </h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={withdrawalData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="year"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => value.toString()}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {accounts.map((account) => (
              <Bar
                key={account.id}
                dataKey={`${account.name}_withdrawal`}
                fill={account.color}
                name={`${account.name} (${account.type})`}
                stackId="withdrawals"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="text-center">
          This chart shows which accounts your retirement withdrawals come from.
          The stacked bars represent the total withdrawal amount, with each
          account's contribution color-coded. Tax implications are shown in the
          tooltip.
        </p>
      </div>
    </div>
  );
};

export default WithdrawalBreakdownChart;
