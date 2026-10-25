import { render, screen } from "@testing-library/react";
import { mockReducedMotion } from "@/test/reducedMotion";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import Hero from "./Hero";

describe("Hero", () => {
  afterEach(() => mockReducedMotion(false));

  it("names the owner in the page's only h1", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Muhammad Puntodewo Fadhillah");
  });

  it("offers experience, CV download and GitHub", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "View experience →" })).toHaveAttribute("href", "#experience");
    const cv = screen.getByRole("link", { name: "Download CV ↓" });
    expect(cv).toHaveAttribute("href", RESUME_URL);
    expect(cv).toHaveAttribute("download", RESUME_FILENAME);
    expect(screen.getByRole("link", { name: "GitHub ↗" })).toHaveAttribute("href", "https://github.com/mpuntodewof");
  });

  it("shows the first role in full, without typing, under reduced motion", () => {
    mockReducedMotion(true);
    render(<Hero />);
    expect(screen.getByTestId("typed-role")).toHaveTextContent(/^Backend & Integration Engineer$/);
  });
});
