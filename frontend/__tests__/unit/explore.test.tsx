/**
 * Unit tests for the Explore Data page.
 */
import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ExplorePage from "../../src/app/(app)/explore/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
}));

// Mock API
vi.mock("@/lib/api", () => ({
  getMe: vi.fn().mockResolvedValue({ username: "test", role: "admin", name: "Test", email: null }),
  listDatasets: vi.fn().mockResolvedValue([
    { dataset_id: "fused-123", rows: 350, columns: ["Date", "ED", "Temp"], created_at: new Date().toISOString(), metadata: { type: "fused" } },
  ]),
  exploreDataset: vi.fn().mockResolvedValue({
    dataset_id: "fused-123",
    rows: 350,
    columns: 10,
    column_summaries: [
      { name: "ED", dtype: "int64", non_null: 350, null_count: 0, null_pct: 0, unique: 80, mean: 150.5, std: 20.3, min: 90, max: 210 },
    ],
    correlations: { Temp: 0.35, Wind: -0.12 },
    missing_by_column: {},
    target_stats: { mean: 150, std: 20, min: 90, max: 210, median: 148 },
    dow_averages: { Monday: 160, Tuesday: 155, Wednesday: 150, Thursday: 148, Friday: 152, Saturday: 130, Sunday: 125 },
    monthly_averages: { January: 165, February: 160 },
    numeric_columns: ["ED", "Temp", "Wind"],
    date_column: "Date",
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders Explore Data page with header", async () => {
  render(<ExplorePage />);
  await waitFor(() => {
    expect(screen.getByText("Explore Data")).toBeDefined();
  });
});

test("renders KPI summary cards after loading", async () => {
  render(<ExplorePage />);
  await waitFor(() => {
    expect(screen.getByText("Rows")).toBeDefined();
    expect(screen.getByText("350")).toBeDefined();
  });
});

test("renders tab buttons", async () => {
  render(<ExplorePage />);
  await waitFor(() => {
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Patterns")).toBeDefined();
    expect(screen.getByText("Correlations")).toBeDefined();
  });
});

test("renders DOW chart in overview tab", async () => {
  render(<ExplorePage />);
  await waitFor(() => {
    expect(screen.getByText("Average Arrivals by Day of Week")).toBeDefined();
  });
});
