import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import type { YearlyProjection } from "../types";
import { formatCurrency } from "../utils/calculations";

interface ProjectionsChartProps {
  projections: YearlyProjection[];
}

const ProjectionsChart = ({ projections }: ProjectionsChartProps) => {
  if (projections.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <p>No projections to display yet.</p>
          <p className="text-sm">Add accounts to see your retirement chart!</p>
        </div>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = projections.map((projection) => ({
    year: projection.year,
    age: projection.age,
    totalBalance: Math.round(projection.totalBalance),
    contributions: Math.round(projection.contributions),
    withdrawals: Math.round(projection.withdrawals),
    taxes: Math.round(projection.taxes),
    netIncome: Math.round(projection.netIncome),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">Year: {label}</p>
          <p className="text-sm text-gray-600">Age: {data.age}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-blue-600">Total Balance:</span>{" "}
              {formatCurrency(data.totalBalance)}
            </p>
            {data.contributions > 0 && (
              <p className="text-sm">
                <span className="text-green-600">Contributions:</span>{" "}
                {formatCurrency(data.contributions)}
              </p>
            )}
            {data.withdrawals > 0 && (
              <p className="text-sm">
                <span className="text-orange-600">Withdrawals:</span>{" "}
                {formatCurrency(data.withdrawals)}
              </p>
            )}
            {data.taxes > 0 && (
              <p className="text-sm">
                <span className="text-red-600">Taxes:</span>{" "}
                {formatCurrency(data.taxes)}
              </p>
            )}
            {data.netIncome > 0 && (
              <p className="text-sm">
                <span className="text-purple-600">Net Income:</span>{" "}
                {formatCurrency(data.netIncome)}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Retirement Projections
      </h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
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

            {/* Total Balance Area */}
            <Area
              type="monotone"
              dataKey="totalBalance"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Total Balance"
            />

            {/* Contributions Line */}
            <Line
              type="monotone"
              dataKey="contributions"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Contributions"
            />

            {/* Withdrawals Line */}
            <Line
              type="monotone"
              dataKey="withdrawals"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Withdrawals"
            />

            {/* Taxes Line */}
            <Line
              type="monotone"
              dataKey="taxes"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Taxes"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="text-center">
          This chart shows your projected retirement savings over time,
          including contributions, withdrawals, and taxes.
        </p>
      </div>
    </div>
  );
};

export default ProjectionsChart;
