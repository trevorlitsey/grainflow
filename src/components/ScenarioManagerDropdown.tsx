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
    <div className="flex items-center gap-2">
      <select
        value={currentId || ""}
        onChange={handleSwitch}
        className="border rounded px-2 py-1"
      >
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <button onClick={handleNew} className="px-2 py-1 border rounded">
        New
      </button>
      <button onClick={handleRename} className="px-2 py-1 border rounded">
        Rename
      </button>
      {scenarios.length > 1 && (
        <button
          onClick={handleDelete}
          className="px-2 py-1 border rounded text-red-600"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default ScenarioManagerDropdown;
