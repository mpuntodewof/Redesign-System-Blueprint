import { render, screen } from "@testing-library/react";
import BusinessValue from "./BusinessValue";
import type { BusinessValue as BusinessValueData } from "@/data/projects";

const data: BusinessValueData = {
  metrics: [
    { value: "40%", label: "fewer processing errors" },
    { value: "1,000+", label: "daily transactions" },
  ],
  narrative: "The platform absorbed peak-hour load without manual intervention.",
};

describe("BusinessValue", () => {
  it("renders each metric value and label", () => {
    render(<BusinessValue data={data} accent="239 84% 67%" />);
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("fewer processing errors")).toBeInTheDocument();
    expect(screen.getByText("1,000+")).toBeInTheDocument();
    expect(screen.getByText("daily transactions")).toBeInTheDocument();
  });

  it("renders the narrative", () => {
    render(<BusinessValue data={data} accent="239 84% 67%" />);
    expect(screen.getByText(data.narrative)).toBeInTheDocument();
  });

  it("matches the column count to the metric count", () => {
    // A fixed 4-column grid renders three metrics as three tiles and a hole.
    const three: BusinessValueData = {
      metrics: [
        { value: "1", label: "one" },
        { value: "2", label: "two" },
        { value: "3", label: "three" },
      ],
      narrative: "n",
    };
    const { container } = render(<BusinessValue data={three} accent="239 84% 67%" />);
    expect(container.querySelector(".grid")?.className).toContain("sm:grid-cols-3");
  });

  it("renders at most four metrics", () => {
    const many: BusinessValueData = {
      metrics: [
        { value: "1", label: "one" },
        { value: "2", label: "two" },
        { value: "3", label: "three" },
        { value: "4", label: "four" },
        { value: "5", label: "five" },
      ],
      narrative: "n",
    };
    render(<BusinessValue data={many} accent="239 84% 67%" />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });
});
