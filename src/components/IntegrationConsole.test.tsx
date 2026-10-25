import { act, render, screen } from "@testing-library/react";
import { mockReducedMotion } from "@/test/reducedMotion";
import IntegrationConsole from "./IntegrationConsole";

describe("IntegrationConsole", () => {
  afterEach(() => {
    mockReducedMotion(false);
    vi.useRealTimers();
  });

  it("is a labelled figure that says the flow is simulated", () => {
    render(<IntegrationConsole />);
    expect(
      screen.getByRole("figure", { name: "Animated overview of the integrations I build at Bluebird" }),
    ).toBeInTheDocument();
    expect(screen.getByText("SIMULATED FLOW")).toBeInTheDocument();
  });

  it("draws the five systems around the middleware", () => {
    render(<IntegrationConsole />);
    ["Portal Timesheet", "Talenta HR", "Payment gateways", "SAP", "Finance ledger", "middleware"].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument(),
    );
  });

  it("animates packets and rotates the log when motion is allowed", () => {
    vi.useFakeTimers();
    const { container } = render(<IntegrationConsole />);
    expect(container.querySelectorAll(".cx-pkt")).toHaveLength(5);
    const log = screen.getByTestId("console-log");
    expect(log.children).toHaveLength(3);
    const first = log.textContent;
    act(() => vi.advanceTimersByTime(1700));
    expect(log.textContent).not.toBe(first);
  });

  it("is static under reduced motion", () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    const { container } = render(<IntegrationConsole />);
    expect(container.querySelectorAll(".cx-pkt")).toHaveLength(0);
    const log = screen.getByTestId("console-log");
    const first = log.textContent;
    act(() => vi.advanceTimersByTime(5000));
    expect(log.textContent).toBe(first);
  });
});
