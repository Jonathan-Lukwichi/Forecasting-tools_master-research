import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "../../src/components/layout/Sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

test("renders HealthForecast brand", () => {
  render(<Sidebar />);
  expect(screen.getByText("HealthForecast")).toBeDefined();
});

test("renders all navigation items", () => {
  render(<Sidebar />);
  expect(screen.getByText("Dashboard")).toBeDefined();
  expect(screen.getByText("Upload Data")).toBeDefined();
  expect(screen.getByText("Prepare Data")).toBeDefined();
  expect(screen.getByText("Explore Data")).toBeDefined();
  expect(screen.getByText("Train Models")).toBeDefined();
  expect(screen.getByText("Model Results")).toBeDefined();
  expect(screen.getByText("Forecast")).toBeDefined();
  expect(screen.getByText("Staff Planner")).toBeDefined();
  expect(screen.getByText("Supply Planner")).toBeDefined();
  expect(screen.getByText("Action Center")).toBeDefined();
});

test("shows thesis prototype footer", () => {
  render(<Sidebar />);
  expect(screen.getByText("Master Thesis Prototype")).toBeDefined();
});
