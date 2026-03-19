/**
 * Pipeline Store — Zustand state management for HealthForecast AI
 *
 * Mirrors Streamlit's st.session_state structure for cross-page data sharing.
 * Persists to localStorage so state survives page refreshes.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// =============================================================================
// Types
// =============================================================================

export interface DatasetInfo {
  dataset_id: string;
  type: "patient" | "weather" | "calendar" | "reason" | "fused" | "processed";
  rows: number;
  columns: string[];
  hospital?: string;
  uploadedAt: string;
}

export interface ModelResult {
  name: string;
  mape: number;
  rmse: number;
  mae: number;
  trainedAt: string;
}

export interface ForecastResult {
  model: string;
  forecasts: number[];
  dates: string[];
  createdAt: string;
}

export interface StaffPlanResult {
  success: boolean;
  coverage_pct: number;
  total_staff: number;
  overtime_hours: number;
  daily_cost: number;
  schedule: Array<{
    day: string;
    staff: number;
    demand: number;
  }>;
  createdAt: string;
}

export interface SupplyPlanResult {
  success: boolean;
  service_level: number;
  total_cost: number;
  items_count: number;
  item_breakdown: Array<{
    name: string;
    demand: number;
    order_qty: number;
    safety_stock: number;
    cost: number;
  }>;
  createdAt: string;
}

export interface PipelineState {
  // Current hospital selection
  selectedHospital: string | null;

  // Dataset IDs for each stage (mirrors st.session_state keys)
  patientDatasetId: string | null;
  weatherDatasetId: string | null;
  calendarDatasetId: string | null;
  reasonDatasetId: string | null;
  fusedDatasetId: string | null;
  processedDatasetId: string | null;

  // Dataset metadata
  datasets: Record<string, DatasetInfo>;

  // Model results (keyed by model name)
  modelResults: Record<string, ModelResult>;
  bestModelName: string | null;

  // Active forecast
  activeForecast: ForecastResult | null;

  // Staff planning
  staffPlan: StaffPlanResult | null;

  // Supply planning
  supplyPlan: SupplyPlanResult | null;

  // Pipeline progress flags
  hasUploadedData: boolean;
  hasFusedData: boolean;
  hasProcessedData: boolean;
  hasTrainedModels: boolean;
  hasForecast: boolean;
  hasStaffPlan: boolean;
  hasSupplyPlan: boolean;

  // Actions
  setSelectedHospital: (hospital: string) => void;
  setDataset: (type: DatasetInfo["type"], info: DatasetInfo) => void;
  setFusedDataset: (datasetId: string, rows: number, columns: string[]) => void;
  setProcessedDataset: (datasetId: string, rows: number, columns: string[]) => void;
  addModelResult: (result: ModelResult) => void;
  setActiveForecast: (forecast: ForecastResult) => void;
  setStaffPlan: (plan: StaffPlanResult) => void;
  setSupplyPlan: (plan: SupplyPlanResult) => void;
  clearPipeline: () => void;
  getActiveDatasetId: () => string | null;
}

// =============================================================================
// Initial State
// =============================================================================

const initialState = {
  selectedHospital: null,
  patientDatasetId: null,
  weatherDatasetId: null,
  calendarDatasetId: null,
  reasonDatasetId: null,
  fusedDatasetId: null,
  processedDatasetId: null,
  datasets: {},
  modelResults: {},
  bestModelName: null,
  activeForecast: null,
  staffPlan: null,
  supplyPlan: null,
  hasUploadedData: false,
  hasFusedData: false,
  hasProcessedData: false,
  hasTrainedModels: false,
  hasForecast: false,
  hasStaffPlan: false,
  hasSupplyPlan: false,
};

// =============================================================================
// Store
// =============================================================================

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedHospital: (hospital) => {
        set({ selectedHospital: hospital });
      },

      setDataset: (type, info) => {
        const updates: Partial<PipelineState> = {
          datasets: { ...get().datasets, [info.dataset_id]: info },
          hasUploadedData: true,
        };

        // Set the appropriate dataset ID based on type
        switch (type) {
          case "patient":
            updates.patientDatasetId = info.dataset_id;
            break;
          case "weather":
            updates.weatherDatasetId = info.dataset_id;
            break;
          case "calendar":
            updates.calendarDatasetId = info.dataset_id;
            break;
          case "reason":
            updates.reasonDatasetId = info.dataset_id;
            break;
          case "fused":
            updates.fusedDatasetId = info.dataset_id;
            updates.hasFusedData = true;
            break;
          case "processed":
            updates.processedDatasetId = info.dataset_id;
            updates.hasProcessedData = true;
            break;
        }

        set(updates);
      },

      setFusedDataset: (datasetId, rows, columns) => {
        const info: DatasetInfo = {
          dataset_id: datasetId,
          type: "fused",
          rows,
          columns,
          uploadedAt: new Date().toISOString(),
        };
        set({
          fusedDatasetId: datasetId,
          hasFusedData: true,
          datasets: { ...get().datasets, [datasetId]: info },
        });
      },

      setProcessedDataset: (datasetId, rows, columns) => {
        const info: DatasetInfo = {
          dataset_id: datasetId,
          type: "processed",
          rows,
          columns,
          uploadedAt: new Date().toISOString(),
        };
        set({
          processedDatasetId: datasetId,
          hasProcessedData: true,
          datasets: { ...get().datasets, [datasetId]: info },
        });
      },

      addModelResult: (result) => {
        const currentResults = get().modelResults;
        const newResults = { ...currentResults, [result.name]: result };

        // Find best model (lowest MAPE)
        let bestName = result.name;
        let bestMape = result.mape;
        for (const [name, r] of Object.entries(newResults)) {
          if (r.mape < bestMape) {
            bestMape = r.mape;
            bestName = name;
          }
        }

        set({
          modelResults: newResults,
          bestModelName: bestName,
          hasTrainedModels: true,
        });
      },

      setActiveForecast: (forecast) => {
        set({
          activeForecast: forecast,
          hasForecast: true,
        });
      },

      setStaffPlan: (plan) => {
        set({
          staffPlan: plan,
          hasStaffPlan: plan.success,
        });
      },

      setSupplyPlan: (plan) => {
        set({
          supplyPlan: plan,
          hasSupplyPlan: plan.success,
        });
      },

      clearPipeline: () => {
        set(initialState);
      },

      getActiveDatasetId: () => {
        const state = get();
        // Return the most processed dataset available
        return (
          state.processedDatasetId ||
          state.fusedDatasetId ||
          state.patientDatasetId ||
          null
        );
      },
    }),
    {
      name: "healthforecast-pipeline",
      // Only persist these keys to localStorage
      partialize: (state) => ({
        selectedHospital: state.selectedHospital,
        patientDatasetId: state.patientDatasetId,
        weatherDatasetId: state.weatherDatasetId,
        calendarDatasetId: state.calendarDatasetId,
        reasonDatasetId: state.reasonDatasetId,
        fusedDatasetId: state.fusedDatasetId,
        processedDatasetId: state.processedDatasetId,
        datasets: state.datasets,
        modelResults: state.modelResults,
        bestModelName: state.bestModelName,
        activeForecast: state.activeForecast,
        staffPlan: state.staffPlan,
        supplyPlan: state.supplyPlan,
        hasUploadedData: state.hasUploadedData,
        hasFusedData: state.hasFusedData,
        hasProcessedData: state.hasProcessedData,
        hasTrainedModels: state.hasTrainedModels,
        hasForecast: state.hasForecast,
        hasStaffPlan: state.hasStaffPlan,
        hasSupplyPlan: state.hasSupplyPlan,
      }),
    }
  )
);

// =============================================================================
// Selectors (for convenience)
// =============================================================================

export const selectHasData = (state: PipelineState) => state.hasUploadedData;
export const selectActiveDatasetId = (state: PipelineState) =>
  state.processedDatasetId || state.fusedDatasetId || state.patientDatasetId;
export const selectPipelineProgress = (state: PipelineState) => ({
  upload: state.hasUploadedData,
  fuse: state.hasFusedData,
  process: state.hasProcessedData,
  train: state.hasTrainedModels,
  forecast: state.hasForecast,
  staff: state.hasStaffPlan,
  supply: state.hasSupplyPlan,
});
