import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ExperienceDetail from "./ExperienceDetail";

function renderRole(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/experience/${slug}`]}>
      <Routes>
        <Route path="/experience/:slug" element={<ExperienceDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ExperienceDetail", () => {
  it("shows the role, company and verbatim CV bullets", () => {
    renderRole("bluebird-group");
    expect(screen.getByRole("heading", { level: 1, name: "IT Application Developer" })).toBeInTheDocument();
    expect(screen.getByText("PT Bluebird Group")).toBeInTheDocument();
    expect(screen.getByText(/Driver SIO \(Surat Izin Operasi\)/)).toBeInTheDocument();
  });

  it("links to case studies from the same employer", () => {
    renderRole("bluebird-group");
    expect(screen.getByRole("link", { name: "Talenta → SAP Integration →" })).toHaveAttribute(
      "href",
      "/project/talenta-sap-integration",
    );
  });

  it("lists private systems without a link", () => {
    renderRole("bayer-indonesia");
    expect(screen.getByText("E-Credit Management")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /E-Credit Management/ })).not.toBeInTheDocument();
  });

  it("steps to the neighbouring roles", () => {
    renderRole("bank-raya");
    expect(screen.getByRole("link", { name: /More recent role.*PT Bluebird Group/ })).toHaveAttribute(
      "href",
      "/experience/bluebird-group",
    );
    expect(screen.getByRole("link", { name: /Earlier role.*PT Bayer Indonesia/ })).toHaveAttribute(
      "href",
      "/experience/bayer-indonesia",
    );
  });

  it("handles an unknown role", () => {
    renderRole("nowhere");
    expect(screen.getByRole("heading", { name: "Role not found" })).toBeInTheDocument();
  });
});
