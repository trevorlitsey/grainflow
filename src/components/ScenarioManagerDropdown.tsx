import React, { useState } from "react";
import {
  listScenarios,
  setCurrentScenario,
  getCurrentScenarioId,
  saveScenario,
  loadCurrentScenario,
  deleteScenario,
  renameScenario,
} from "../utils/storage";
import type { RetirementData } from "../types";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

const ScenarioManagerDropdown: React.FC = () => {
  const [scenarios, setScenarios] = useState(listScenarios());
  const [currentId, setCurrentId] = useState(getCurrentScenarioId());

  // Refresh scenarios from storage
  const refresh = () => {
    setScenarios(listScenarios());
    setCurrentId(getCurrentScenarioId());
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentScenario(e.target.value);
    refresh();
    window.location.reload(); // reload app state for new scenario
  };

  const handleNew = () => {
    const name = prompt("Name for new scenario:");
    if (!name) return;
    const id = generateId();
    const currentData: RetirementData = loadCurrentScenario();
    saveScenario(id, name, currentData); // copy current scenario
    setCurrentScenario(id);
    refresh();
    window.location.reload();
  };

  const handleRename = () => {
    if (!currentId) return;
    const scenario = scenarios.find((s) => s.id === currentId);
    if (!scenario) return;
    const newName = prompt("Rename scenario:", scenario.name);
    if (!newName || newName === scenario.name) return;
    renameScenario(currentId, newName);
    refresh();
  };

  const handleDelete = () => {
    if (!currentId) return;
    if (scenarios.length === 1) return; // Prevent deleting the last scenario
    if (!window.confirm("Delete this scenario? This cannot be undone.")) return;
    deleteScenario(currentId);
    refresh();
    window.location.reload();
  };

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col items-center gap-2 w-full max-w-md">
        <label
          className="text-sm font-medium text-gray-700 mb-1"
          htmlFor="scenario-select"
        >
          Scenario:
        </label>
        <div className="flex items-center gap-2 w-full justify-center">
          <select
            id="scenario-select"
            value={currentId || ""}
            onChange={handleSwitch}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition w-48 text-gray-800"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleNew}
            className="btn-primary px-3 py-2"
            title="Create new scenario"
          >
            New
          </button>
          <button
            onClick={handleRename}
            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            title="Rename scenario"
          >
            Rename
          </button>
          {scenarios.length > 1 && (
            <button
              onClick={handleDelete}
              className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              title="Delete scenario"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioManagerDropdown;
