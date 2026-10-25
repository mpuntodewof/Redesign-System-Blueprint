import { fireEvent, render, screen } from "@testing-library/react";
import Experience from "./Experience";

describe("Experience", () => {
  it("lists the four CV roles, newest first", () => {
    render(<Experience />);
    const companies = ["PT Bluebird Group", "PT Bank Raya", "PT Bayer Indonesia", "Thortech Asia"];
    const positions = companies.map((name) => screen.getByText(name));
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i - 1].compareDocumentPosition(positions[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it("shows system modules with their integration routes and impact chips", () => {
    render(<Experience />);
    expect(screen.getByText("Talenta Receiver Service")).toBeInTheDocument();
    expect(screen.getByText("Talenta HR → SAP")).toBeInTheDocument();
    expect(screen.getByText("−40% errors")).toBeInTheDocument();
    expect(screen.getByText("1,000+ tx/day")).toBeInTheDocument();
  });

  it("opens the full CV bullets for a role", () => {
    render(<Experience />);
    fireEvent.click(screen.getByRole("button", { name: "Full details: IT Application Developer at PT Bluebird Group" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Driver SIO \(Surat Izin Operasi\)/)).toBeInTheDocument();
  });
});
