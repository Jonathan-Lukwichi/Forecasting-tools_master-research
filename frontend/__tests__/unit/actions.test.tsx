import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ActionsPage from "../../src/app/actions/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/api", () => ({
  getMe: vi.fn().mockResolvedValue({ username: "t", role: "admin", name: "T", email: null }),
  listDatasets: vi.fn().mockResolvedValue([]),
  getRecommendations: vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());

test("renders Action Center header", async () => {
  render(<ActionsPage />);
  await waitFor(() => expect(screen.getByText("Action Center")).toBeDefined());
});

test("shows context buttons", async () => {
  render(<ActionsPage />);
  await waitFor(() => {
    expect(screen.getByText("General")).toBeDefined();
    expect(screen.getByText("Staff")).toBeDefined();
    expect(screen.getByText("Supply")).toBeDefined();
  });
});

test("shows generate button", async () => {
  render(<ActionsPage />);
  await waitFor(() => expect(screen.getByText("Generate Recommendations")).toBeDefined());
});

test("shows empty state initially", async () => {
  render(<ActionsPage />);
  await waitFor(() => expect(screen.getByText(/Select a dataset/)).toBeDefined());
});
