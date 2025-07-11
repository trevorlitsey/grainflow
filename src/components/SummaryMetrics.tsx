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
            <div className="space-y-6">
              {/* Income Section */}
              <div>
                <h5 className="text-sm font-medium text-green-700 uppercase tracking-wide mb-3">
                  Income
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <h6 className="text-xs font-semibold text-green-700 mb-2">
                      At Start of Retirement
                    </h6>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Yearly:</span>
                        <span className="font-semibold text-green-700">
                          {formatCurrency(
                            (retirementProjection?.withdrawals || 0) -
                              (retirementProjection?.taxes || 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly:</span>
                        <span className="font-semibold text-green-700">
                          {formatCurrency(
                            ((retirementProjection?.withdrawals || 0) -
                              (retirementProjection?.taxes || 0)) /
                              12
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <h6 className="text-xs font-semibold text-green-700 mb-2">
                      At End of Retirement
                    </h6>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Yearly:</span>
                        <span className="font-semibold text-green-700">
                          {formatCurrency(
                            (endProjection?.withdrawals || 0) -
                              (endProjection?.taxes || 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly:</span>
                        <span className="font-semibold text-green-700">
                          {formatCurrency(
                            ((endProjection?.withdrawals || 0) -
                              (endProjection?.taxes || 0)) /
                              12
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spending Section */}
              <div>
                <h5 className="text-sm font-medium text-orange-700 uppercase tracking-wide mb-3">
                  Spending
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <h6 className="text-xs font-semibold text-orange-700 mb-2">
                      At Start of Retirement
                    </h6>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Yearly:</span>
                        <span className="font-semibold text-orange-700">
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly:</span>
                        <span className="font-semibold text-orange-700">
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
                  <div className="bg-orange-50 rounded-lg p-3">
                    <h6 className="text-xs font-semibold text-orange-700 mb-2">
                      At End of Retirement
                    </h6>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Yearly:</span>
                        <span className="font-semibold text-orange-700">
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly:</span>
                        <span className="font-semibold text-orange-700">
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

          {/* Warning if income < expenses */}
          {(() => {
            const startIncome =
              (retirementProjection?.withdrawals || 0) -
              (retirementProjection?.taxes || 0);
            const startSpending =
              12 *
              data.currentMonthlySpending *
              Math.pow(
                1 + data.inflationRate / 100,
                data.retirementAge - data.currentAge
              );

            if (startIncome < startSpending) {
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Income Gap Warning
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          Your projected after-tax income at retirement (
                          {formatCurrency(startIncome)}) is less than your
                          projected yearly spending (
                          {formatCurrency(startSpending)}).
                        </p>
                        <p className="mt-1">
                          Consider increasing your savings, working longer, or
                          reducing your spending to bridge this gap.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default SummaryMetrics;
