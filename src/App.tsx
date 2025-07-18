import { useState, useEffect } from "react";
import type { RetirementData, YearlyProjection, Account } from "./types";
import {
  loadCurrentScenario,
  saveScenario,
  getCurrentScenarioId,
  listScenarios,
} from "./utils/storage";
import { DEFAULT_RETIREMENT_DATA } from "./types";
import Header from "./components/Header";
import InputForm from "./components/InputForm";
import AccountManager from "./components/AccountManager";
import ProjectionsChart from "./components/ProjectionsChart";
import AccountBalancesChart from "./components/AccountBalancesChart";
import WithdrawalBreakdownChart from "./components/WithdrawalBreakdownChart";
import SummaryMetrics from "./components/SummaryMetrics";
import ContributionsByAccountChart from "./components/ContributionsByAccountChart";
import { calculateYearlyProjections } from "./utils/calculations";

function App() {
  const [retirementData, setRetirementData] = useState<RetirementData>(
    loadCurrentScenario() || DEFAULT_RETIREMENT_DATA
  );
  const [projections, setProjections] = useState<YearlyProjection[]>([]);

  useEffect(() => {
    if (!retirementData) return;
    const newProjections = calculateYearlyProjections(retirementData);
    setProjections(newProjections);
  }, [retirementData]);

  useEffect(() => {
    if (!retirementData) return;
    // Save to the current scenario
    const currentId = getCurrentScenarioId();
    if (!currentId) return;
    // Get the current scenario name
    const scenario = listScenarios().find((s) => s.id === currentId);
    const name = scenario ? scenario.name : "Scenario";
    saveScenario(currentId, name, retirementData);
  }, [retirementData]);

  const updateRetirementData = (updates: Partial<RetirementData>) => {
    setRetirementData((prev) => ({ ...prev, ...updates }));
  };

  if (!retirementData) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

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
              retirementAge={retirementData.retirementAge}
            />
          </div>

          {/* Right Column - Charts and Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <SummaryMetrics projections={projections} data={retirementData} />
            <ProjectionsChart projections={projections} />
            <AccountBalancesChart
              accounts={retirementData.accounts}
              projections={projections}
            />
            <WithdrawalBreakdownChart
              projections={projections}
              accounts={retirementData.accounts}
            />
            <ContributionsByAccountChart data={retirementData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
