import { render, screen } from "@testing-library/react";
import CaseStudy from "./CaseStudy";
import type { CaseStudy as CaseStudyData } from "@/data/projects";

const data: CaseStudyData = {
  context: "Two systems exchanged data by spreadsheet.",
  challenge: "Payroll data could not tolerate duplicate writes.",
  approach: "Idempotency keys on every write, with a replay log.",
  outcome: "Manual reconciliation dropped to zero.",
};

describe("CaseStudy", () => {
  it("renders all four block labels", () => {
    render(<CaseStudy data={data} accent="239 84% 67%" />);
    expect(screen.getByText("Context")).toBeInTheDocument();
    expect(screen.getByText("Challenge")).toBeInTheDocument();
    expect(screen.getByText("Approach")).toBeInTheDocument();
    expect(screen.getByText("Outcome")).toBeInTheDocument();
  });

  it("splits a block into paragraphs on a blank line", () => {
    const multi = { ...data, approach: "First point.\n\nSecond point." };
    render(<CaseStudy data={multi} accent="239 84% 67%" />);
    expect(screen.getByText("First point.")).toBeInTheDocument();
    expect(screen.getByText("Second point.")).toBeInTheDocument();
  });

  it("renders the prose for each block", () => {
    render(<CaseStudy data={data} accent="239 84% 67%" />);
    expect(screen.getByText(data.context)).toBeInTheDocument();
    expect(screen.getByText(data.challenge)).toBeInTheDocument();
    expect(screen.getByText(data.approach)).toBeInTheDocument();
    expect(screen.getByText(data.outcome)).toBeInTheDocument();
  });
});
