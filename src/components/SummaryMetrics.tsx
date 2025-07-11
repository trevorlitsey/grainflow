import { DollarSign, Target, ArrowUp, ArrowDown } from "lucide-react";
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

  // Calculate current total from starting amounts
  const currentTotal = data.accounts.reduce(
    (sum, account) => sum + account.startingAmount,
    0
  );

  const metrics = [
    {
      label: "Current Total",
      value: formatCurrency(currentTotal),
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
      label: "Total Contributions",
      value: formatCurrency(totalContributions),
      icon: ArrowUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Withdrawals",
      value: formatCurrency(totalWithdrawals),
      icon: ArrowDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
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
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Retirement Summary
        </h3>
        <div className="space-y-8">
          {/* Timeline */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
              Timeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Retirement Year:</span>
                <span className="font-semibold text-gray-800">
                  {retirementYear}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Retirement Duration:</span>
                <span className="font-semibold text-gray-800">
                  {data.lifeExpectancy - data.retirementAge} years
                </span>
              </div>
            </div>
          </div>

          {/* Balances */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
              Key Balances
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Peak Balance:</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(maxProjection?.totalBalance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Final Balance:</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(endProjection?.totalBalance || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Income & Spending */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
              Income & Spending
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start of Retirement */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  At Start of Retirement
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Yearly Income:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(retirementProjection?.withdrawals || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Yearly Spending:</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(
                        12 *
                          data.currentMonthlySpending *
                          Math.pow(
                            1 + data.inflationRate / 100,
                            data.retirementAge - data.currentAge
                          )
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Monthly Income:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(
                        (retirementProjection?.withdrawals || 0) / 12
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Monthly Spending:</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(
                        data.currentMonthlySpending *
                          Math.pow(
                            1 + data.inflationRate / 100,
                            data.retirementAge - data.currentAge
                          )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* End of Retirement */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  At End of Retirement
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Yearly Income:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(endProjection?.withdrawals || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Yearly Spending:</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(
                        12 *
                          data.currentMonthlySpending *
                          Math.pow(
                            1 + data.inflationRate / 100,
                            data.lifeExpectancy - data.currentAge
                          )
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Monthly Income:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency((endProjection?.withdrawals || 0) / 12)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Monthly Spending:</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(
                        data.currentMonthlySpending *
                          Math.pow(
                            1 + data.inflationRate / 100,
                            data.lifeExpectancy - data.currentAge
                          )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryMetrics;
