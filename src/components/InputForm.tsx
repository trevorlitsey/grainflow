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
            min="40"
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
      </div>
    </div>
  );
};

export default InputForm;
