import { render, screen } from "@testing-library/react";
import ArchitectureDiagram from "./ArchitectureDiagram";
import type { Architecture } from "@/data/projects";

const data: Architecture = {
  summary: "Shift data flows from the HR platform into SAP via a queued worker.",
  nodes: [
    { id: "hr", label: "HR Platform", sub: "external", group: "source" },
    { id: "api", label: "Receiver API", sub: ".NET Core", group: "service" },
    { id: "db", label: "Staging Store", group: "store" },
    { id: "sap", label: "SAP", group: "target" },
  ],
  edges: [
    { from: "hr", to: "api", label: "webhook" },
    { from: "api", to: "db" },
    { from: "db", to: "sap", label: "RFC" },
  ],
  decisions: [
    { title: "Queued writes", detail: "Retries survive downstream outages." },
  ],
};

describe("ArchitectureDiagram", () => {
  it("renders the summary", () => {
    render(<ArchitectureDiagram data={data} accent="239 84% 67%" />);
    expect(screen.getByText(data.summary)).toBeInTheDocument();
  });

  it("renders every node label in the mobile stack", () => {
    render(<ArchitectureDiagram data={data} accent="239 84% 67%" />);
    const stack = screen.getByTestId("architecture-stack");
    expect(stack).toHaveTextContent("HR Platform");
    expect(stack).toHaveTextContent("Receiver API");
    expect(stack).toHaveTextContent("Staging Store");
    expect(stack).toHaveTextContent("SAP");
  });

  it("renders node sub-labels where present", () => {
    render(<ArchitectureDiagram data={data} accent="239 84% 67%" />);
    expect(screen.getByTestId("architecture-stack")).toHaveTextContent(".NET Core");
  });

  it("renders decisions when present", () => {
    render(<ArchitectureDiagram data={data} accent="239 84% 67%" />);
    expect(screen.getByText("Queued writes")).toBeInTheDocument();
    expect(screen.getByText("Retries survive downstream outages.")).toBeInTheDocument();
  });

  it("omits the decisions block when absent", () => {
    const withoutDecisions: Architecture = {
      summary: data.summary,
      nodes: data.nodes,
      edges: data.edges,
    };
    render(<ArchitectureDiagram data={withoutDecisions} accent="239 84% 67%" />);
    expect(screen.queryByText("Key Decisions")).not.toBeInTheDocument();
  });

  it("renders nothing when there are no nodes", () => {
    const empty: Architecture = { summary: "s", nodes: [], edges: [] };
    const { container } = render(<ArchitectureDiagram data={empty} accent="239 84% 67%" />);
    expect(container).toBeEmptyDOMElement();
  });
});
