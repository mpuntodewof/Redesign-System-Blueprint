import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProjectDetail from "./ProjectDetail";

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
