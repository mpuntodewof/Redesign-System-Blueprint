import { render, screen } from "@testing-library/react";
import KpiStrip from "./KpiStrip";

describe("KpiStrip", () => {
  it("shows the four static figures", () => {
    render(<KpiStrip />);
    ["backend & integration", "interbank transfers", "active cardholders", "processing errors"].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument(),
    );
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(screen.getByText("−40")).toBeInTheDocument();
  });
});
