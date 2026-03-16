/**
 * Unit tests for the Prepare Data page.
 */
import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PreparePage from "../../src/app/prepare/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock API functions
vi.mock("@/lib/api", () => ({
  getMe: vi.fn().mockResolvedValue({ username: "test", role: "admin", name: "Test", email: null }),
  listDatasets: vi.fn().mockResolvedValue([
    { dataset_id: "abc-123", rows: 365, columns: ["Date", "ED"], created_at: new Date().toISOString(), metadata: { type: "patient" } },
    { dataset_id: "def-456", rows: 365, columns: ["Date", "Temp"], created_at: new Date().toISOString(), metadata: { type: "weather" } },
  ]),
  fuseDatasets: vi.fn(),
  engineerFeatures: vi.fn(),
  getDataset: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders Prepare Data page with header", async () => {
  render(<PreparePage />);
  await waitFor(() => {
    expect(screen.getByText("Prepare Data")).toBeDefined();
  });
});

test("renders Step 1 section", async () => {
  render(<PreparePage />);
  await waitFor(() => {
    expect(screen.getByText(/Step 1/)).toBeDefined();
  });
});

test("renders dataset selector dropdowns", async () => {
  render(<PreparePage />);
  await waitFor(() => {
    expect(screen.getByText(/Patient Data/)).toBeDefined();
    expect(screen.getByText(/Weather Data/)).toBeDefined();
  });
});

test("shows Fuse Datasets button", async () => {
  render(<PreparePage />);
  await waitFor(() => {
    expect(screen.getByText("Fuse Datasets")).toBeDefined();
  });
});
