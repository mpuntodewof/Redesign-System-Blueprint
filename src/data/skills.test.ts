import { skillCategories } from "./skills";

// Copied word for word from the CV (2026-10-25), in CV order.
const CV_SKILLS: Record<string, string[]> = {
  Backend: [".NET Core", "C#", "ASP.NET", "gRPC", "RESTful APIs", "PHP", "Laravel", "Microservices", "API Gateway", "Clean Architecture", "Background Services", "Golang"],
  Frontend: ["React.js", "Bootstrap", "HTML", "CSS", "JavaScript", "Material UI"],
  Databases: ["SQL Server", "MySQL", "Relational Database Design", "Query Optimization"],
  "Tools & DevOps": ["Git", "GitHub", "GitLab", "Postman", "Jira", "Docker", "CI/CD", "Jenkins"],
  Other: ["Agile/Scrum", "SAP Integration", "API Documentation", "Claude Code", "Agentic AI"],
};

describe("skillCategories", () => {
  it("matches the CV's five categories in order", () => {
    expect(skillCategories.map((c) => c.title)).toEqual(Object.keys(CV_SKILLS));
  });

  it("lists exactly the CV's skills in each category", () => {
    for (const category of skillCategories) {
      expect(category.skills.map((s) => s.name)).toEqual(CV_SKILLS[category.title]);
    }
  });

  it("has 35 skills in total", () => {
    expect(skillCategories.flatMap((c) => c.skills)).toHaveLength(35);
  });

  it("loads every logo from the pinned devicon release", () => {
    for (const skill of skillCategories.flatMap((c) => c.skills)) {
      if (skill.icon.kind === "logo") {
        expect(skill.icon.src).toMatch(/^https:\/\/cdn\.jsdelivr\.net\/gh\/devicons\/devicon@v2\.16\.0\/icons\//);
      }
    }
  });
});
