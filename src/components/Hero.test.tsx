import { render, screen } from "@testing-library/react";
import { mockReducedMotion } from "@/test/reducedMotion";
import { AVAILABILITY, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import Hero from "./Hero";

describe("Hero", () => {
  afterEach(() => mockReducedMotion(false));

  it("names the owner in the page's only h1", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Muhammad Puntodewo Fadhillah");
  });

  it("leads with availability and the work-with-me call to action", () => {
    render(<Hero />);
    expect(screen.getByText(AVAILABILITY)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Work with me →" })).toHaveAttribute("href", "#work");
    const cv = screen.getByRole("link", { name: "Download CV ↓" });
    expect(cv).toHaveAttribute("href", RESUME_URL);
    expect(cv).toHaveAttribute("download", RESUME_FILENAME);
    expect(screen.getByRole("link", { name: "GitHub ↗" })).toHaveAttribute("href", "https://github.com/mpuntodewof");
    expect(screen.getByText(/systems running 24\/7 in production/)).toBeInTheDocument();
  });

  it("shows the first role in full, without typing, under reduced motion", () => {
    mockReducedMotion(true);
    render(<Hero />);
    expect(screen.getByTestId("typed-role")).toHaveTextContent(/^Backend & Integration Engineer$/);
  });
});
