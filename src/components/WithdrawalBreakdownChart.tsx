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

interface WithdrawalDataPoint {
  year: number;
  age: number;
  totalWithdrawal: number;
  totalTaxes: number;
  netIncome: number;
  [key: string]: number; // For dynamic account withdrawal and tax properties
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

  // Use all projections, including years with zero withdrawals
  const allProjections = projections;

  if (allProjections.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <p>No projection data available.</p>
          <p className="text-sm">Add accounts to see withdrawal breakdown!</p>
        </div>
      </div>
    );
  }

  // Calculate withdrawal breakdown by account
  const withdrawalData = allProjections.map((projection) => {
    const dataPoint: WithdrawalDataPoint = {
      year: projection.year,
      age: projection.age,
      totalWithdrawal: Math.round(projection.withdrawals),
      totalTaxes: Math.round(projection.taxes),
      netIncome: Math.round(projection.netIncome),
    };

    // Use the actual withdrawal amounts from the projection
    accounts.forEach((account) => {
      const withdrawalAmount = projection.accountWithdrawals[account.id] || 0;
      dataPoint[`${account.name}_withdrawal`] = Math.round(withdrawalAmount);
      // Note: Individual account taxes are not available in the projection
      // The totalTaxes field contains the correct total taxes for the year
      dataPoint[`${account.name}_tax`] = 0; // We'll show total taxes in tooltip instead
    });

    return dataPoint;
  });

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ payload: WithdrawalDataPoint }>;
    label?: string;
  }) => {
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
                return (
                  <div key={account.id} className="text-xs">
                    <span style={{ color: account.color }}>●</span>{" "}
                    <span style={{ color: account.color }}>
                      {account.name}:
                    </span>{" "}
                    {formatCurrency(withdrawal)}
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
          Before age 59½, only brokerage accounts can withdraw. After 59½,
          withdrawals follow this order: brokerage to zero, then IRA, then Roth
          IRA. Tax implications are shown in the tooltip.
        </p>
      </div>
    </div>
  );
};

export default WithdrawalBreakdownChart;
