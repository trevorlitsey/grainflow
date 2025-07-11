import { User, Target } from "lucide-react";
import type { RetirementData } from "../types";

interface InputFormProps {
  data: RetirementData;
  onUpdate: (updates: Partial<RetirementData>) => void;
}

const InputForm = ({ data, onUpdate }: InputFormProps) => {
  const handleInputChange = (field: keyof RetirementData, value: number) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-primary-600" />
        Personal Information
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Age
          </label>
          <input
            type="number"
            value={data.currentAge}
            onChange={(e) =>
              handleInputChange("currentAge", parseInt(e.target.value) || 0)
            }
            className="input-field"
            min="18"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retirement Age
          </label>
          <input
            type="number"
            value={data.retirementAge}
            onChange={(e) =>
              handleInputChange("retirementAge", parseInt(e.target.value) || 0)
            }
            className="input-field"
            min={data.currentAge + 1 || 40}
            max="80"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Life Expectancy
          </label>
          <input
            type="number"
            value={data.lifeExpectancy}
            onChange={(e) =>
              handleInputChange("lifeExpectancy", parseInt(e.target.value) || 0)
            }
            className="input-field"
            min="60"
            max="120"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Monthly Spending
          </label>
          <input
            type="number"
            value={data.currentMonthlySpending}
            onChange={(e) =>
              handleInputChange(
                "currentMonthlySpending",
                parseFloat(e.target.value) || 0
              )
            }
            className="input-field"
            min="0"
            step="100"
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-6 mt-8 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary-600" />
        Financial Parameters
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Annual Return (%)
          </label>
          <input
            type="number"
            value={data.expectedReturn}
            onChange={(e) =>
              handleInputChange(
                "expectedReturn",
                parseFloat(e.target.value) || 0
              )
            }
            className="input-field"
            min="0"
            max="20"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inflation Rate (%)
          </label>
          <input
            type="number"
            value={data.inflationRate}
            onChange={(e) =>
              handleInputChange(
                "inflationRate",
                parseFloat(e.target.value) || 0
              )
            }
            className="input-field"
            min="0"
            max="10"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            value={data.taxRate}
            onChange={(e) =>
              handleInputChange("taxRate", parseFloat(e.target.value) || 0)
            }
            className="input-field"
            min="0"
            max="50"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capital Gains Tax Rate (%)
          </label>
          <input
            type="number"
            value={data.capitalGainsRate}
            onChange={(e) =>
              handleInputChange(
                "capitalGainsRate",
                parseFloat(e.target.value) || 0
              )
            }
            className="input-field"
            min="0"
            max="30"
            step="0.5"
          />
        </div>
        <div>
          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              checked={!!data.allowEarlyIRAWithdrawals}
              onChange={(e) =>
                onUpdate({ allowEarlyIRAWithdrawals: e.target.checked })
              }
              className="form-checkbox h-4 w-4 text-primary-600"
            />
            <span className="ml-2 text-sm text-gray-700">
              Allow early IRA/Roth IRA withdrawals (10% penalty before age 59½)
            </span>
          </label>
        </div>
      </div>

      {/* Withdrawal Plans */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Withdrawal Plans (Portfolio-wide)
        </h3>
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              Set custom withdrawal percentages for any age range. If no plan is
              active, the default 4% rule applies.
            </span>
            <button
              type="button"
              onClick={() => {
                const newPlan = {
                  id:
                    Date.now().toString() + Math.random().toString(36).slice(2),
                  percentage: 4,
                  startAge: data.retirementAge,
                  endAge: data.lifeExpectancy,
                };
                onUpdate({
                  withdrawalPlans: [...(data.withdrawalPlans || []), newPlan],
                });
              }}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 whitespace-nowrap"
            >
              + Add Plan
            </button>
          </div>
          {(data.withdrawalPlans || []).map((plan, idx) => (
            <div key={plan.id} className="bg-gray-50 rounded-lg p-3">
              <div className="mb-2 text-sm font-medium text-gray-700">
                Withdrawal Plan {idx + 1}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Withdrawal %
                  </label>
                  <input
                    type="number"
                    placeholder="4"
                    min="0"
                    max="100"
                    value={plan.percentage}
                    onChange={(e) => {
                      const updated = (data.withdrawalPlans || []).map((p) =>
                        p.id === plan.id
                          ? {
                              ...p,
                              percentage: parseFloat(e.target.value) || 0,
                            }
                          : p
                      );
                      onUpdate({ withdrawalPlans: updated });
                    }}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Age
                  </label>
                  <input
                    type="number"
                    placeholder={data.retirementAge.toString()}
                    value={plan.startAge}
                    onChange={(e) => {
                      const updated = (data.withdrawalPlans || []).map((p) =>
                        p.id === plan.id
                          ? { ...p, startAge: parseInt(e.target.value) || 0 }
                          : p
                      );
                      onUpdate({ withdrawalPlans: updated });
                    }}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Age
                  </label>
                  <input
                    type="number"
                    placeholder={data.lifeExpectancy.toString()}
                    value={plan.endAge}
                    onChange={(e) => {
                      const updated = (data.withdrawalPlans || []).map((p) =>
                        p.id === plan.id
                          ? {
                              ...p,
                              endAge:
                                parseInt(e.target.value) || data.lifeExpectancy,
                            }
                          : p
                      );
                      onUpdate({ withdrawalPlans: updated });
                    }}
                    className="input-field text-sm"
                  />
                </div>
                <div className="flex md:justify-center mt-4 md:mt-0">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate({
                        withdrawalPlans: (data.withdrawalPlans || []).filter(
                          (p) => p.id !== plan.id
                        ),
                      })
                    }
                    className="btn-secondary text-red-500 hover:text-red-700 w-full"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(data.withdrawalPlans || []).length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No withdrawal plans. Click "Add Plan" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputForm;
