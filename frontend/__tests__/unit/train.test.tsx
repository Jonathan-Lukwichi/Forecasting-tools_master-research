/**
 * Unit tests for the Train Models page.
 */
import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TrainPage from "../../src/app/train/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/api", () => ({
  getMe: vi.fn().mockResolvedValue({ username: "test", role: "admin", name: "Test", email: null }),
  listDatasets: vi.fn().mockResolvedValue([
    { dataset_id: "fused-123", rows: 350, columns: ["Date", "ED"], created_at: new Date().toISOString(), metadata: { type: "fused" } },
  ]),
  submitTrainingJob: vi.fn(),
  submitBaselineJob: vi.fn(),
  getJobStatus: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

test("renders Train Models page header", async () => {
  render(<TrainPage />);
  await waitFor(() => {
    expect(screen.getByText("Train Models")).toBeDefined();
  });
});

test("renders ML model cards", async () => {
  render(<TrainPage />);
  await waitFor(() => {
    expect(screen.getByText("XGBoost")).toBeDefined();
    expect(screen.getByText("LSTM")).toBeDefined();
    expect(screen.getByText("ANN")).toBeDefined();
  });
});

test("renders tab buttons", async () => {
  render(<TrainPage />);
  await waitFor(() => {
    expect(screen.getByText("Machine Learning")).toBeDefined();
    expect(screen.getByText("Baseline Models")).toBeDefined();
  });
});
