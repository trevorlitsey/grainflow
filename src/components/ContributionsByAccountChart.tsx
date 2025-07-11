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
import type { RetirementData } from "../types";
import { formatCurrency } from "../utils/calculations";

interface ContributionsByAccountChartProps {
  data: RetirementData;
}

const ContributionsByAccountChart = ({
  data,
}: ContributionsByAccountChartProps) => {
  if (data.accounts.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <p>No account data to display yet.</p>
          <p className="text-sm">
            Add accounts to see your contribution breakdown!
          </p>
        </div>
      </div>
    );
  }

  // Calculate total contributions by account type
  const contributionData = [
    {
      accountType: "Traditional IRA",
      contributions: data.accounts
        .filter((acc) => acc.type === "IRA")
        .reduce((sum, acc) => {
          const totalContributions = acc.contributionPlans.reduce(
            (planSum, plan) => {
              const years = plan.endAge - plan.startAge + 1;
              return planSum + plan.yearlyAmount * years;
            },
            0
          );
          return sum + totalContributions;
        }, 0),
      color: "#3B82F6",
    },
    {
      accountType: "Roth IRA",
      contributions: data.accounts
        .filter((acc) => acc.type === "Roth IRA")
        .reduce((sum, acc) => {
          const totalContributions = acc.contributionPlans.reduce(
            (planSum, plan) => {
              const years = plan.endAge - plan.startAge + 1;
              return planSum + plan.yearlyAmount * years;
            },
            0
          );
          return sum + totalContributions;
        }, 0),
      color: "#10B981",
    },
    {
      accountType: "Brokerage",
      contributions: data.accounts
        .filter((acc) => acc.type === "Brokerage")
        .reduce((sum, acc) => {
          const totalContributions = acc.contributionPlans.reduce(
            (planSum, plan) => {
              const years = plan.endAge - plan.startAge + 1;
              return planSum + plan.yearlyAmount * years;
            },
            0
          );
          return sum + totalContributions;
        }, 0),
      color: "#F59E0B",
    },
  ];

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { accountType: string; contributions: number; color: string };
      value: number;
      dataKey: string;
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.accountType}</p>
          <p className="text-sm text-gray-600">
            Total Contributions: {formatCurrency(data.contributions)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Total Contributions by Account Type
      </h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={contributionData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="accountType" stroke="#6b7280" fontSize={12} />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Bar
              dataKey="contributions"
              fill="#3B82F6"
              name="Total Contributions"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="text-center">
          This chart shows the total planned contributions for each account type
          over your working years.
        </p>
      </div>
    </div>
  );
};

export default ContributionsByAccountChart;
