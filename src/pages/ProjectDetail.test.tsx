import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProjectDetail from "./ProjectDetail";
import projects, { type Project } from "@/data/projects";

vi.mock("@/data/projects", async () => {
  const actual = await vi.importActual<{ default: Project[] }>("@/data/projects");
  const base = actual.default[0];
  const enriched: Project = {
    ...base,
    slug: "fixture-full",
    caseStudy: {
      context: "Context prose.",
      challenge: "Challenge prose.",
      approach: "Approach prose.",
      outcome: "Outcome prose.",
    },
    architecture: {
      summary: "Summary prose.",
      nodes: [
        { id: "s", label: "Source", group: "source" },
        { id: "t", label: "Target", group: "target" },
      ],
      edges: [{ from: "s", to: "t" }],
    },
    businessValue: {
      metrics: [{ value: "99%", label: "uptime" }],
      narrative: "Narrative prose.",
    },
  };
  return { ...actual, default: [...actual.default, enriched] };
});

function renderProject(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/project/${slug}`]}>
      <Routes>
        <Route path="/project/:slug" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProjectDetail GitHub card", () => {
  it("renders the GitHub card when githubUrl is present", () => {
    renderProject("stockledger");
    expect(screen.getByText("View on GitHub")).toBeInTheDocument();
  });

  it("omits the GitHub card when githubUrl is empty", () => {
    renderProject("e-credit-management");
    expect(screen.queryByText("View on GitHub")).not.toBeInTheDocument();
  });
});

describe("ProjectDetail optional sections", () => {
  it("renders only the baseline sections when no optional fields are present", () => {
    // Found rather than hardcoded: naming a project here means the test breaks
    // the day that project gains content, which is a stale fixture rather than
    // a real regression. This is the only guard on the optional-field fallback.
    const bare = projects.find(
      (p) => p.clickable !== false && !p.caseStudy && !p.architecture && !p.businessValue
    );
    if (!bare) throw new Error("every clickable project now has optional content");
    renderProject(bare.slug);
    expect(screen.getByRole("heading", { name: "Project Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Key Features" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Case Study" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Architecture" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Business Value" })).not.toBeInTheDocument();
  });

  it("keeps rendering Overview and Features for every project", () => {
    renderProject("stockledger");
    expect(screen.getByRole("heading", { name: "Project Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Key Features" })).toBeInTheDocument();
  });
});

describe("ProjectDetail with full content", () => {
  it("renders all five sections when every optional field is present", () => {
    renderProject("fixture-full");
    expect(screen.getByRole("heading", { name: "Project Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Case Study" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Architecture" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Business Value" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Key Features" })).toBeInTheDocument();
  });

  it("renders case study prose and metrics", () => {
    renderProject("fixture-full");
    expect(screen.getByText("Challenge prose.")).toBeInTheDocument();
    expect(screen.getByText("99%")).toBeInTheDocument();
    expect(screen.getByText("Narrative prose.")).toBeInTheDocument();
  });
});
