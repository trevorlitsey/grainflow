import type { RetirementData } from "../types";
import { DEFAULT_RETIREMENT_DATA } from "../types";

const STORAGE_KEY = "retirement-app-scenarios";

// Types for scenario storage
interface ScenarioEntry {
  id: string;
  name: string;
  data: RetirementData;
}

interface ScenarioStorage {
  scenarios: ScenarioEntry[];
  currentScenarioId: string | null;
}

// Helper to load the full scenario storage object
function loadScenarioStorage(): ScenarioStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load scenario storage:", error);
  }
  // Fallback: try to migrate from old single-scenario format
  try {
    const old = localStorage.getItem("retirement-app-data");
    if (old) {
      const parsed = JSON.parse(old);
      const migrated: ScenarioStorage = {
        scenarios: [
          {
            id: "default",
            name: "Default Scenario",
            data: parsed,
          },
        ],
        currentScenarioId: "default",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      localStorage.removeItem("retirement-app-data");
      return migrated;
    }
  } catch {
    // ignore
  }
  return { scenarios: [], currentScenarioId: null };
}

function saveScenarioStorage(storage: ScenarioStorage) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Failed to save scenario storage:", error);
  }
}

function ensureDefaultScenario(storage: ScenarioStorage): ScenarioStorage {
  if (storage.scenarios.length === 0) {
    const defaultScenario = {
      id: "default-" + Date.now().toString(),
      name: "Default Scenario",
      data: DEFAULT_RETIREMENT_DATA,
    };
    storage.scenarios.push(defaultScenario);
    storage.currentScenarioId = defaultScenario.id;
    saveScenarioStorage(storage);
  }
  return storage;
}

export function listScenarios(): { id: string; name: string }[] {
  let storage = loadScenarioStorage();
  storage = ensureDefaultScenario(storage);
  return storage.scenarios.map(({ id, name }) => ({ id, name }));
}

export function saveScenario(
  id: string,
  name: string,
  data: RetirementData
): void {
  let storage = loadScenarioStorage();
  storage = ensureDefaultScenario(storage);
  const idx = storage.scenarios.findIndex((s) => s.id === id);
  if (idx !== -1) {
    storage.scenarios[idx] = { id, name, data };
  } else {
    storage.scenarios.push({ id, name, data });
  }
  saveScenarioStorage(storage);
}

export function loadScenario(id: string): RetirementData {
  let storage = loadScenarioStorage();
  storage = ensureDefaultScenario(storage);
  const scenario = storage.scenarios.find((s) => s.id === id);
  if (scenario) {
    return scenario.data;
  }
  return DEFAULT_RETIREMENT_DATA;
}

export function deleteScenario(id: string): void {
  let storage = loadScenarioStorage();
  storage = ensureDefaultScenario(storage);
  storage.scenarios = storage.scenarios.filter((s) => s.id !== id);
  if (storage.currentScenarioId === id) {
    storage.currentScenarioId =
      storage.scenarios.length > 0 ? storage.scenarios[0].id : null;
  }
  saveScenarioStorage(storage);
}

export function setCurrentScenario(id: string): void {
  let storage = loadScenarioStorage();
  storage = ensureDefaultScenario(storage);
  storage.currentScenarioId = id;
  saveScenarioStorage(storage);
}

export function getCurrentScenarioId(): string | null {
  let storage = loadScenarioStorage();
  storage = ensureDefaultScenario(storage);
  return storage.currentScenarioId;
}

export function loadCurrentScenario(): RetirementData {
  let storage = loadScenarioStorage();
  storage = ensureDefaultScenario(storage);
  if (storage.currentScenarioId) {
    const scenario = storage.scenarios.find(
      (s) => s.id === storage.currentScenarioId
    );
    if (scenario) return scenario.data;
  }
  return DEFAULT_RETIREMENT_DATA;
}

export function renameScenario(id: string, newName: string): void {
  let storage = loadScenarioStorage();
  storage = ensureDefaultScenario(storage);
  const scenario = storage.scenarios.find((s) => s.id === id);
  if (scenario) {
    scenario.name = newName;
    saveScenarioStorage(storage);
  }
}

export function clearAllScenarios(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear all scenarios:", error);
  }
}
