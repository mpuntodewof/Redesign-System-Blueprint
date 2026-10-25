import { render, screen } from "@testing-library/react";
import { skillCategories } from "@/data/skills";
import TechStack from "./TechStack";

describe("TechStack", () => {
  it("renders one h3 per category", () => {
    render(<TechStack />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Backend", "Frontend", "Databases", "Tools & DevOps", "Other"]);
  });

  it("renders every skill name", () => {
    render(<TechStack />);
    for (const skill of skillCategories.flatMap((c) => c.skills)) {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    }
  });

  it("summarises the totals in the heading meta", () => {
    render(<TechStack />);
    expect(screen.getByText("5 domains · 35 skills")).toBeInTheDocument();
  });
});
