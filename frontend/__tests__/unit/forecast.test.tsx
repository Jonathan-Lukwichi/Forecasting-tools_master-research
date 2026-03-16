import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ForecastPage from "../../src/app/forecast/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("recharts", () => ({
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null, Area: () => null, XAxis: () => null, YAxis: () => null,
  CartesianGrid: () => null, Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/lib/api", () => ({
  getMe: vi.fn().mockResolvedValue({ username: "t", role: "admin", name: "T", email: null }),
  listDatasets: vi.fn().mockResolvedValue([]),
  getModelComparison: vi.fn().mockResolvedValue({ models: [], best_model_id: "", ranking_metric: "rmse" }),
  generateForecast: vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());

test("renders Patient Forecast header", async () => {
  render(<ForecastPage />);
  await waitFor(() => expect(screen.getByText("Patient Forecast")).toBeDefined());
});

test("shows empty state when no forecast", async () => {
  render(<ForecastPage />);
  await waitFor(() => expect(screen.getByText(/Select a dataset/)).toBeDefined());
});
