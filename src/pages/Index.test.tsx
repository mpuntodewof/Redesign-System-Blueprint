import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import Index from "./Index";

const renderIndex = () =>
  render(
    <MemoryRouter>
      <Index />
    </MemoryRouter>,
  );

describe("Index", () => {
  it("renders the sections in the agreed order and nothing retired", () => {
    const { container } = renderIndex();
    const ids = Array.from(container.querySelectorAll("section[id]")).map((s) => s.id);
    expect(ids).toEqual(["experience", "projects", "stack", "work", "contact"]);
  });

  it("offers the CV download in exactly four places", () => {
    const { container } = renderIndex();
    const links = container.querySelectorAll(`a[download="${RESUME_FILENAME}"]`);
    expect(links).toHaveLength(4);
    links.forEach((link) => expect(link).toHaveAttribute("href", RESUME_URL));
  });
});
