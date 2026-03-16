/**
 * Unit tests for the Model Results page.
 */
import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ResultsPage from "../../src/app/results/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
}));

vi.mock("@/lib/api", () => ({
  getMe: vi.fn().mockResolvedValue({ username: "test", role: "admin", name: "Test", email: null }),
  listDatasets: vi.fn().mockResolvedValue([
    { dataset_id: "fused-123", rows: 350, columns: ["Date", "ED"], created_at: new Date().toISOString(), metadata: { type: "fused" } },
  ]),
  getModelComparison: vi.fn().mockResolvedValue({
    models: [
      { model_id: "m1", model_type: "xgboost", metrics: { rmse: 12.5, mae: 9.3, mape: 6.1 }, training_time: 2.5 },
      { model_id: "m2", model_type: "lstm", metrics: { rmse: 14.2, mae: 10.8, mape: 7.2 }, training_time: 45.3 },
    ],
    best_model_id: "m1",
    ranking_metric: "rmse",
  }),
}));

beforeEach(() => vi.clearAllMocks());

test("renders Model Results page header", async () => {
  render(<ResultsPage />);
  await waitFor(() => {
    expect(screen.getByText("Model Results")).toBeDefined();
  });
});

test("displays best model information", async () => {
  render(<ResultsPage />);
  await waitFor(() => {
    // Look for any model type text that appears after data loads
    expect(screen.getByText(/Best Model/)).toBeDefined();
  });
});

test("renders rank metric selector", async () => {
  render(<ResultsPage />);
  await waitFor(() => {
    expect(screen.getByText("Rank by RMSE")).toBeDefined();
  });
});
