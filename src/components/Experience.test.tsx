import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Experience from "./Experience";

const renderExperience = () =>
  render(
    <MemoryRouter>
      <Experience />
    </MemoryRouter>,
  );

describe("Experience", () => {
  it("lists the four CV roles, newest first", () => {
    renderExperience();
    const companies = ["PT Bluebird Group", "PT Bank Raya", "PT Bayer Indonesia", "Thortech Asia"];
    const positions = companies.map((name) => screen.getByText(name));
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i - 1].compareDocumentPosition(positions[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it("shows system modules with their integration routes and impact chips", () => {
    renderExperience();
    expect(screen.getByText("Talenta Receiver Service")).toBeInTheDocument();
    expect(screen.getByText("Talenta HR → SAP")).toBeInTheDocument();
    expect(screen.getByText("−40% errors")).toBeInTheDocument();
    expect(screen.getByText("1,000+ tx/day")).toBeInTheDocument();
  });

  it("links each role to its full details page", () => {
    renderExperience();
    expect(
      screen.getByRole("link", { name: "Full details: IT Application Developer at PT Bluebird Group" }),
    ).toHaveAttribute("href", "/experience/bluebird-group");
  });
});
