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

interface AccountBalancesChartProps {
  projections: YearlyProjection[];
  accounts: Account[];
}

const AccountBalancesChart = ({
  projections,
  accounts,
}: AccountBalancesChartProps) => {
  if (projections.length === 0 || accounts.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <p>No account data to display yet.</p>
          <p className="text-sm">Add accounts to see your balance breakdown!</p>
        </div>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = projections.map((projection) => {
    const dataPoint: any = {
      year: projection.year,
      age: projection.age,
    };

    // Add each account's balance
    accounts.forEach((account) => {
      dataPoint[account.name] = Math.round(
        projection.accountBalances[account.id] || 0
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
            {accounts.map((account) => (
              <p key={account.id} className="text-sm">
                <span style={{ color: account.color }}>●</span>{" "}
                <span style={{ color: account.color }}>{account.name}:</span>{" "}
                {formatCurrency(data[account.name] || 0)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Account Balances Over Time
      </h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
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
                dataKey={account.name}
                fill={account.color}
                name={`${account.name} (${account.type})`}
                stackId="balances"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="text-center">
          This chart shows how each of your accounts grows over time, helping
          you visualize the contribution of each account type to your retirement
          savings.
        </p>
      </div>
    </div>
  );
};

export default AccountBalancesChart;
