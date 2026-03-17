import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SupplyPage from "../../src/app/(app)/supply/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/api", () => ({
  getMe: vi.fn().mockResolvedValue({ username: "t", role: "admin", name: "T", email: null }),
  listDatasets: vi.fn().mockResolvedValue([]),
  optimizeInventory: vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());

test("renders Supply Planner header", async () => {
  render(<SupplyPage />);
  await waitFor(() => expect(screen.getByText("Supply Planner")).toBeDefined());
});

test("shows default inventory items", async () => {
  render(<SupplyPage />);
  await waitFor(() => expect(screen.getByDisplayValue("N95 Masks")).toBeDefined());
});

test("shows optimize button", async () => {
  render(<SupplyPage />);
  await waitFor(() => expect(screen.getByText("Optimize Inventory")).toBeDefined());
});
