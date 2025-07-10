import { DollarSign, Calendar, TrendingUp, Target } from "lucide-react";
import type { RetirementData } from "../types";
import type { YearlyProjection } from "../types";
import { formatCurrency } from "../utils/calculations";

interface SummaryMetricsProps {
  projections: YearlyProjection[];
  data: RetirementData;
}

const SummaryMetrics = ({ projections, data }: SummaryMetricsProps) => {
  if (projections.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Add some accounts to see your retirement projections!</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const retirementYear = currentYear + (data.retirementAge - data.currentAge);

  // Find key projections
  const currentProjection = projections[0];
  const retirementProjection = projections.find(
    (p) => p.age === data.retirementAge
  );
  const maxProjection = projections.reduce((max, p) =>
    p.totalBalance > max.totalBalance ? p : max
  );
  const endProjection = projections[projections.length - 1];

  // Calculate total contributions
  const totalContributions = projections
    .filter((p) => p.age < data.retirementAge)
    .reduce((sum, p) => sum + p.contributions, 0);

  // Calculate total withdrawals
  const totalWithdrawals = projections
    .filter((p) => p.age >= data.retirementAge)
    .reduce((sum, p) => sum + p.withdrawals, 0);

  // Calculate total taxes
  const totalTaxes = projections
    .filter((p) => p.age >= data.retirementAge)
    .reduce((sum, p) => sum + p.taxes, 0);

  const metrics = [
    {
      label: "Current Total",
      value: formatCurrency(currentProjection?.totalBalance || 0),
      icon: DollarSign,
      color: "text-primary-600",
      bgColor: "bg-primary-50",
    },
    {
      label: "Retirement Nest Egg",
      value: formatCurrency(retirementProjection?.totalBalance || 0),
      icon: Target,
      color: "text-success-600",
      bgColor: "bg-success-50",
    },
    {
      label: "Peak Balance",
      value: formatCurrency(maxProjection?.totalBalance || 0),
      icon: TrendingUp,
      color: "text-warning-600",
      bgColor: "bg-warning-50",
    },
    {
      label: "Years to Retirement",
      value: `${data.retirementAge - data.currentAge}`,
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div
              className={`w-12 h-12 rounded-full ${metric.bgColor} flex items-center justify-center mx-auto mb-3`}
            >
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Detailed Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Retirement Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Retirement Year:</span>
              <span className="font-medium">{retirementYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Contributions:</span>
              <span className="font-medium">
                {formatCurrency(totalContributions)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Withdrawals:</span>
              <span className="font-medium">
                {formatCurrency(totalWithdrawals)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Taxes Paid:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(totalTaxes)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Net Retirement Income:</span>
              <span className="font-medium text-success-600">
                {formatCurrency(totalWithdrawals - totalTaxes)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Final Balance:</span>
              <span className="font-medium">
                {formatCurrency(endProjection?.totalBalance || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retirement Duration:</span>
              <span className="font-medium">
                {data.lifeExpectancy - data.retirementAge} years
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Income (4% rule):</span>
              <span className="font-medium">
                {formatCurrency(
                  ((retirementProjection?.totalBalance || 0) * 0.04) / 12
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryMetrics;
