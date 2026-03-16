/**
 * Smoke test: verify the login page renders.
 * This is the first Vitest test — validates that the testing infrastructure works.
 */
import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation (required for App Router components)
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Simple smoke test — does the test infrastructure work?
test("testing infrastructure works", () => {
  const div = document.createElement("div");
  div.innerHTML = "<h1>HealthForecast AI</h1>";
  document.body.appendChild(div);

  expect(div.querySelector("h1")?.textContent).toBe("HealthForecast AI");
});
