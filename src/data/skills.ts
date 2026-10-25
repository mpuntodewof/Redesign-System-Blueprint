export type SkillIcon =
  | { kind: "logo"; src: string; invertInDark?: boolean; padInDark?: boolean }
  | { kind: "glyph"; glyph: string };

export interface Skill {
  name: string;
  icon: SkillIcon;
}

export interface SkillCategory {
  title: string;
  /** Spans two columns on wide screens. */
  wide?: boolean;
  skills: Skill[];
}

// Pinned release: @latest can change logos under a published page.
const devicon = (path: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${path}.svg`;
const logo = (path: string, options: { invertInDark?: boolean; padInDark?: boolean } = {}): SkillIcon => ({
  kind: "logo",
  src: devicon(path),
  ...options,
});
// Concepts have no real logo; a neutral glyph avoids borrowing another brand's mark.
const glyph = (value: string): SkillIcon => ({ kind: "glyph", glyph: value });

/** Mirrors the Skills section of the CV word for word. Update both together. */
export const skillCategories: SkillCategory[] = [
  {
    title: "Backend",
    wide: true,
    skills: [
      { name: ".NET Core", icon: logo("dotnetcore/dotnetcore-original") },
      { name: "C#", icon: logo("csharp/csharp-original") },
      { name: "ASP.NET", icon: logo("dot-net/dot-net-original") },
      { name: "gRPC", icon: logo("grpc/grpc-original", { padInDark: true }) },
      { name: "RESTful APIs", icon: glyph("{}") },
      { name: "PHP", icon: logo("php/php-original") },
      { name: "Laravel", icon: logo("laravel/laravel-original") },
      { name: "Microservices", icon: glyph("⬡") },
      { name: "API Gateway", icon: glyph("⇄") },
      { name: "Clean Architecture", icon: glyph("◎") },
      { name: "Background Services", icon: glyph("↻") },
      { name: "Golang", icon: logo("go/go-original") },
    ],
  },
  {
    title: "Frontend",
    skills: [
      { name: "React.js", icon: logo("react/react-original") },
      { name: "Bootstrap", icon: logo("bootstrap/bootstrap-original") },
      { name: "HTML", icon: logo("html5/html5-original") },
      { name: "CSS", icon: logo("css3/css3-original") },
      { name: "JavaScript", icon: logo("javascript/javascript-original") },
      { name: "Material UI", icon: logo("materialui/materialui-original") },
    ],
  },
  {
    title: "Databases",
    skills: [
      { name: "SQL Server", icon: logo("microsoftsqlserver/microsoftsqlserver-original") },
      { name: "MySQL", icon: logo("mysql/mysql-original", { padInDark: true }) },
      { name: "Relational Database Design", icon: glyph("⊞") },
      { name: "Query Optimization", icon: glyph("⚡\uFE0E") },
    ],
  },
  {
    title: "Tools & DevOps",
    skills: [
      { name: "Git", icon: logo("git/git-original") },
      { name: "GitHub", icon: logo("github/github-original", { invertInDark: true }) },
      { name: "GitLab", icon: logo("gitlab/gitlab-original") },
      { name: "Postman", icon: logo("postman/postman-original") },
      { name: "Jira", icon: logo("jira/jira-original") },
      { name: "Docker", icon: logo("docker/docker-original") },
      { name: "CI/CD", icon: glyph("⟳") },
      { name: "Jenkins", icon: logo("jenkins/jenkins-original") },
    ],
  },
  {
    title: "Other",
    skills: [
      { name: "Agile/Scrum", icon: glyph("◷") },
      { name: "SAP Integration", icon: glyph("⇆") },
      { name: "API Documentation", icon: logo("swagger/swagger-original") },
      { name: "Claude Code", icon: glyph("✦") },
      { name: "Agentic AI", icon: glyph("◈") },
    ],
  },
];
