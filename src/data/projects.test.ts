import projects from "./projects";

const slugs = (group: "professional" | "personal") =>
  projects.filter((p) => p.group === group).map((p) => p.slug);

describe("projects data", () => {
  it("features exactly one project, the Talenta → SAP integration, with a three-step highlight", () => {
    const featured = projects.filter((p) => p.featured);
    expect(featured.map((p) => p.slug)).toEqual(["talenta-sap-integration"]);
    expect(featured[0].highlight).toEqual({
      context: expect.any(String),
      approach: expect.any(String),
      outcome: expect.any(String),
    });
  });

  it("splits the eight projects into five professional and three personal", () => {
    expect(slugs("professional")).toEqual([
      "talenta-sap-integration",
      "e-timesheet",
      "banking-middleware-apis",
      "e-management-of-change",
      "e-credit-management",
    ]);
    expect(slugs("personal")).toEqual(["stockledger", "habit-tracker", "meal-planner"]);
  });

  it("names the organisation for every professional project and none for personal ones", () => {
    for (const project of projects) {
      if (project.group === "professional") expect(project.org).toBeTruthy();
      else expect(project.org).toBeUndefined();
    }
  });
});
