import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import StaffPage from "../../src/app/staff/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null, XAxis: () => null, YAxis: () => null,
  CartesianGrid: () => null, Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/lib/api", () => ({
  getMe: vi.fn().mockResolvedValue({ username: "t", role: "admin", name: "T", email: null }),
  listDatasets: vi.fn().mockResolvedValue([]),
  optimizeStaff: vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());

test("renders Staff Planner header", async () => {
  render(<StaffPage />);
  await waitFor(() => expect(screen.getByText("Staff Planner")).toBeDefined());
});

test("shows configuration section", async () => {
  render(<StaffPage />);
  await waitFor(() => expect(screen.getByText("Configuration")).toBeDefined());
});

test("shows optimize button", async () => {
  render(<StaffPage />);
  await waitFor(() => expect(screen.getByText("Optimize Schedule")).toBeDefined());
});
