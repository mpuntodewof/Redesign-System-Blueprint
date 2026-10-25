import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Projects from "./Projects";

const renderProjects = () =>
  render(
    <MemoryRouter>
      <Projects />
    </MemoryRouter>,
  );

const card = (title: string) => screen.getByRole("heading", { level: 3, name: title }).closest(".hud") as HTMLElement;

describe("Projects", () => {
  it("renders all eight projects as h3 cards", () => {
    renderProjects();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(8);
  });

  it("leads with the featured Talenta → SAP case study and its three steps", () => {
    renderProjects();
    const featured = card("Talenta → SAP Integration");
    expect(within(featured).getByText("Featured case study · Backend System")).toBeInTheDocument();
    ["Context", "Approach", "Outcome"].forEach((step) =>
      expect(within(featured).getByRole("heading", { level: 4, name: new RegExp(step) })).toBeInTheDocument(),
    );
    expect(within(featured).getByRole("link", { name: "Read case study →" })).toHaveAttribute(
      "href",
      "/project/talenta-sap-integration",
    );
  });

  it("labels the two groups", () => {
    renderProjects();
    expect(screen.getByText("Professional systems")).toBeInTheDocument();
    expect(screen.getByText("Personal builds")).toBeInTheDocument();
  });

  it("marks internal systems as private and gives them no case-study link", () => {
    renderProjects();
    const credit = card("E-Credit Management");
    expect(within(credit).getByText("Internal system · private")).toBeInTheDocument();
    expect(within(credit).queryByRole("link")).toBeNull();
  });

  it("links a case study but notes a private codebase when there is no repo", () => {
    renderProjects();
    const banking = card("Banking Middleware APIs");
    expect(within(banking).getByRole("link", { name: "Case study →" })).toHaveAttribute(
      "href",
      "/project/banking-middleware-apis",
    );
    expect(within(banking).getByText("Private codebase")).toBeInTheDocument();
  });

  it("previews four stack chips and counts the rest", () => {
    renderProjects();
    expect(within(card("E-Timesheet")).getByText("+4 more")).toBeInTheDocument();
  });
});
