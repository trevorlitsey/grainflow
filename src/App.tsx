import { useState, useEffect } from "react";
import type { RetirementData, YearlyProjection, Account } from "./types";
import { loadRetirementData, saveRetirementData } from "./utils/storage";
import Header from "./components/Header";
import InputForm from "./components/InputForm";
import AccountManager from "./components/AccountManager";
import ProjectionsChart from "./components/ProjectionsChart";
import AccountBalancesChart from "./components/AccountBalancesChart";
import WithdrawalBreakdownChart from "./components/WithdrawalBreakdownChart";
import SummaryMetrics from "./components/SummaryMetrics";
import { calculateYearlyProjections } from "./utils/calculations";

function App() {
  const [retirementData, setRetirementData] = useState<RetirementData>(
    loadRetirementData()
  );
  const [projections, setProjections] = useState<YearlyProjection[]>([]);

  useEffect(() => {
    const newProjections = calculateYearlyProjections(retirementData);
    setProjections(newProjections);
  }, [retirementData]);

  useEffect(() => {
    saveRetirementData(retirementData);
  }, [retirementData]);

  const updateRetirementData = (updates: Partial<RetirementData>) => {
    setRetirementData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Input Forms */}
          <div className="lg:col-span-1 space-y-6">
            <InputForm data={retirementData} onUpdate={updateRetirementData} />
            <AccountManager
              accounts={retirementData.accounts}
              onAccountsChange={(accounts: Account[]) =>
                updateRetirementData({ accounts })
              }
            />
          </div>

          {/* Right Column - Charts and Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <SummaryMetrics projections={projections} data={retirementData} />
            <ProjectionsChart projections={projections} />
            <AccountBalancesChart
              projections={projections}
              accounts={retirementData.accounts}
            />
            <WithdrawalBreakdownChart
              projections={projections}
              accounts={retirementData.accounts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
